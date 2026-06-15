import argparse
import json
import re

import pymysql


# MySQL 데이터베이스 연결 정보
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "26252221",
    "database": "mychefai",
    "charset": "utf8mb4",
}


# 자주 쓰는 핵심 레시피는 자동 보강보다 직접 쓴 조리법이 더 안전하다.
BEGINNER_STEP_OVERRIDES = {
    "김치찌개": [
        "김치는 도마에 올려 한입에 먹기 좋은 2~3cm 크기로 자른다. 너무 잘게 자르면 끓이는 동안 흐물흐물해지니 숟가락에 한 조각씩 올라올 정도가 좋다.",
        "돼지고기는 키친타월로 겉의 핏물을 가볍게 눌러 닦고, 두부는 1.5cm 두께로 썰며 대파는 어슷하게 썬다. 재료를 미리 준비해 두면 끓이는 중간에 허둥대지 않는다.",
        "냄비에 식용유를 1큰술 두르고 중불로 켠 뒤 김치를 넣어 2~3분 볶는다. 김치 가장자리가 살짝 투명해지고 신맛이 부드러워지는 냄새가 나면 잘 볶아진 것이다.",
        "돼지고기를 넣고 3분 정도 더 볶는다. 고기 겉면의 붉은빛이 대부분 사라지고 하얗게 익기 시작하면 다음 단계로 넘어간다.",
        "물 2컵 반에서 3컵을 붓고 고춧가루를 넣은 뒤 센 불로 올린다. 국물이 끓어오르면 중불로 줄이고 10분간 끓여 김치와 고기 맛이 국물에 배도록 한다.",
        "두부를 넣고 숟가락으로 세게 젓지 말고 국물만 살짝 끼얹으며 3분 더 끓인다. 두부는 세게 저으면 쉽게 부서진다.",
        "대파를 넣고 1분 더 끓인 뒤 국물을 맛본다. 싱거우면 소금을 아주 조금씩 넣고, 짜면 물을 조금 추가해 맞춘다. 마지막에 불을 끄고 2분 정도 두면 맛이 더 안정된다.",
    ],
    "된장찌개": [
        "두부, 애호박, 양파는 숟가락으로 떠먹기 좋은 1.5cm 크기로 썬다. 대파와 청양고추는 얇게 송송 썰고, 버섯은 밑동을 자른 뒤 손으로 가볍게 찢는다.",
        "냄비에 물 또는 멸치 다시마 육수를 붓고 중불에서 끓인다. 물이 끓기 시작하면 된장을 숟가락에 올려 국물에 조금씩 풀어 덩어리가 남지 않게 한다.",
        "애호박과 양파처럼 익는 데 시간이 걸리는 채소를 먼저 넣고 3~4분 끓인다. 애호박 가장자리가 살짝 투명해지면 다음 재료를 넣을 준비가 된 것이다.",
        "두부와 다진 마늘을 넣고 2분 더 끓인다. 두부가 부서지지 않도록 숟가락으로 냄비 바닥을 긁듯이 천천히 저어준다.",
        "대파, 고추, 버섯을 넣고 1분만 더 끓인다. 마지막 재료들은 오래 끓이면 향과 식감이 약해지므로 짧게 끓이는 것이 좋다.",
        "국물을 맛보고 싱거우면 된장을 아주 조금 더 풀고, 짜면 물을 조금 넣어 맞춘다. 불을 끈 뒤 바로 먹으면 구수한 향이 가장 좋다.",
    ],
}


def parse_steps(raw_steps):
    if raw_steps is None:
        return []
    if isinstance(raw_steps, list):
        return raw_steps
    try:
        parsed = json.loads(raw_steps)
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def clean_step(step):
    if step is None:
        return ""
    step = str(step).strip()
    step = re.sub(r"^\d+\.\s*", "", step)
    step = re.sub(r"\s+", " ", step)
    return step


def is_already_beginner_friendly(step):
    if len(step) >= 65:
        return True
    beginner_markers = ["분", "중불", "약불", "센 불", "확인", "정도", "주의", "익으면", "끓어오르면"]
    return len(step) >= 45 and any(marker in step for marker in beginner_markers)


def sentence(step):
    step = step.strip()
    if step.endswith((".", "!", "?")):
        return step
    return step + "."


def enhance_short_step(title, step):
    step = clean_step(step)
    if not step or is_already_beginner_friendly(step):
        return step

    if "자른" in step or "썬" in step:
        return f"{sentence(step)} 초보자는 재료를 먼저 모두 손질해 두면 조리 중에 당황하지 않는다. 한입에 먹기 좋은 2~3cm 크기를 기준으로 맞춘다."
    if "볶" in step:
        return f"{sentence(step)} 팬이나 냄비를 중불로 달군 뒤 2~3분 정도 저어가며 볶는다. 재료 가장자리가 살짝 투명해지거나 고소한 냄새가 나면 잘 볶아진 것이다."
    if "물" in step and ("붓" in step or "넣" in step):
        return f"{sentence(step)} 물은 한 번에 너무 많이 붓지 말고 표시된 양부터 넣는다. 끓인 뒤 싱거우면 간을 더하고, 짜면 물을 조금 추가한다."
    if "끓" in step:
        return f"{sentence(step)} 센 불에서 끓어오르게 한 뒤 중불로 줄여 끓인다. 국물이 냄비 가장자리에서 보글보글 올라오면 불 세기가 적당하다."
    if "추가" in step or "넣" in step:
        return f"{sentence(step)} 단단한 재료를 먼저 넣고 부드러운 재료는 나중에 넣는다. 넣은 뒤에는 재료가 부서지지 않게 천천히 저어준다."
    if "간" in step or "소금" in step:
        return f"{sentence(step)} 간은 한 번에 많이 하지 말고 조금씩 넣어 맛본다. 뜨거울 때는 짠맛이 약하게 느껴질 수 있으니 천천히 맞춘다."

    return f"{sentence(step)} 처음 요리하는 사람은 이 단계에서 재료의 색, 냄새, 익은 정도를 확인하며 천천히 진행한다."


def enhance_steps(title, steps):
    if title in BEGINNER_STEP_OVERRIDES:
        return BEGINNER_STEP_OVERRIDES[title]

    cleaned = [clean_step(step) for step in steps]
    cleaned = [step for step in cleaned if step]
    return [enhance_short_step(title, step) for step in cleaned]


def load_recipes(cursor, title, exact):
    if title:
        if exact:
            cursor.execute(
                "SELECT id, title, steps FROM recipes WHERE title = %s ORDER BY id",
                (title,),
            )
        else:
            cursor.execute(
                "SELECT id, title, steps FROM recipes WHERE title LIKE %s ORDER BY id",
                (f"%{title}%",),
            )
    else:
        cursor.execute("SELECT id, title, steps FROM recipes ORDER BY id")
    return cursor.fetchall()


def update_beginner_steps(title, exact, apply):
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    updated_count = 0
    skipped_count = 0

    try:
        rows = load_recipes(cursor, title, exact)
        for recipe_id, recipe_title, raw_steps in rows:
            old_steps = parse_steps(raw_steps)
            new_steps = enhance_steps(recipe_title, old_steps)

            if not new_steps or old_steps == new_steps:
                skipped_count += 1
                continue

            print("\n==================================================")
            print(f"[{recipe_id}] {recipe_title}")
            print("기존 첫 단계:", old_steps[0] if old_steps else "(없음)")
            print("수정 첫 단계:", new_steps[0])

            if apply:
                cursor.execute(
                    "UPDATE recipes SET steps = %s WHERE id = %s",
                    (json.dumps(new_steps, ensure_ascii=False), recipe_id),
                )
            updated_count += 1

        if apply:
            conn.commit()
            print("\nDB 업데이트를 완료했습니다.")
        else:
            print("\n미리보기만 실행했습니다. 실제 반영하려면 --apply 옵션을 붙여 실행하세요.")

        print(f"수정 대상: {updated_count}건")
        print(f"건너뜀: {skipped_count}건")
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="recipes.steps를 초보자 친화적인 조리방법으로 보강합니다.")
    parser.add_argument("--title", help="특정 요리명만 수정합니다. 예: --title 김치찌개")
    parser.add_argument("--exact", action="store_true", help="--title과 정확히 같은 제목만 수정합니다.")
    parser.add_argument("--apply", action="store_true", help="실제 DB에 반영합니다. 없으면 미리보기만 합니다.")
    args = parser.parse_args()

    update_beginner_steps(args.title, args.exact, args.apply)
