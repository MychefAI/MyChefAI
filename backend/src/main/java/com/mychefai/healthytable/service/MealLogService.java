package com.mychefai.healthytable.service;

import com.mychefai.healthytable.domain.MealLog;
import com.mychefai.healthytable.domain.User;
import com.mychefai.healthytable.dto.MealLogDTO;
import com.mychefai.healthytable.repository.MealLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
@RequiredArgsConstructor
public class MealLogService {

    private final MealLogRepository mealLogRepository;

    public List<MealLog> getMealLogs(User user) {
        return mealLogRepository.findByUser(user);
    }

    @Transactional
    public MealLog saveOrUpdateMealLog(User user, MealLogDTO dto) {
        Optional<MealLog> existingLog = mealLogRepository.findByUserAndRecordDate(user, dto.getRecordDate());

        MealLog mealLog;
        if (existingLog.isPresent()) {
            mealLog = existingLog.get();
        } else {
            mealLog = new MealLog();
            mealLog.setUser(user);
            mealLog.setRecordDate(dto.getRecordDate());
        }

        if (dto.getBreakfast() != null) {
            mealLog.setBreakfast(dto.getBreakfast());
            mealLog.setBreakfastCalories(dto.getBreakfastCalories());
            mealLog.setIsAiBreakfast(dto.getIsAiBreakfast());
        }
        if (dto.getLunch() != null) {
            mealLog.setLunch(dto.getLunch());
            mealLog.setLunchCalories(dto.getLunchCalories());
            mealLog.setIsAiLunch(dto.getIsAiLunch());
        }
        if (dto.getDinner() != null) {
            mealLog.setDinner(dto.getDinner());
            mealLog.setDinnerCalories(dto.getDinnerCalories());
            mealLog.setIsAiDinner(dto.getIsAiDinner());
        }
        if (dto.getSnacks() != null)
            mealLog.setSnacks(dto.getSnacks());

        // Update JSON fields for details and stats
        if (dto.getMealDetails() != null) {
            // Merge existing details with new details to prevent overwriting
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> currentDetails = new HashMap<>();

                if (mealLog.getMealDetails() != null && !mealLog.getMealDetails().isEmpty()) {
                    currentDetails = mapper.readValue(mealLog.getMealDetails(),
                            new TypeReference<Map<String, Object>>() {
                            });
                }

                Map<String, Object> newDetails = mapper.readValue(dto.getMealDetails(),
                        new TypeReference<Map<String, Object>>() {
                        });
                currentDetails.putAll(newDetails);

                mealLog.setMealDetails(mapper.writeValueAsString(currentDetails));
            } catch (Exception e) {
                // Fallback: just set the new value if parsing fails
                mealLog.setMealDetails(dto.getMealDetails());
            }
        }

        if (dto.getDailyStats() != null) {
            // For daily stats, usually checking the latest is fine, or we could also merge.
            // Let's overwrite for stats as they are usually recalculated for the day.
            mealLog.setDailyStats(dto.getDailyStats());
        }

        return mealLogRepository.save(mealLog);
    }

    private final com.mychefai.healthytable.service.GeminiService geminiService;

    public String getMonthlyAnalysis(User user, int year, int month) {
        // Fetch all logs for the month
        java.time.YearMonth yearMonth = java.time.YearMonth.of(year, month);
        java.time.LocalDate startDate = yearMonth.atDay(1);
        java.time.LocalDate endDate = yearMonth.atEndOfMonth();

        // Warning: This implies adding a custom query method to Repository or
        // formatting the date filter manually
        // For simplicity, let's fetch all and filter or add a between method.
        // Assuming findByUserAndRecordDateBetween exists or we add it.
        // Let's use findByUser and filter in memory for now to avoid Repo interface
        // changes if possible,
        // OR better, let's add the method to the repository interface in the next step
        // if it doesn't exist.
        // I'll assume we can add it.
        List<MealLog> monthlyLogs = mealLogRepository.findByUserAndRecordDateBetween(user, startDate, endDate);

        // Block the Mono to get the result synchronously
        return geminiService.analyzeMonthlyMealPlan(monthlyLogs).block();
    }
}
