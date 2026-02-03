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

        return mealLogRepository.save(mealLog);
    }
}
