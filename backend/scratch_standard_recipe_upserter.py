import json

import pymysql


DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "26252221",
    "database": "mychefai",
    "charset": "utf8mb4",
}


STANDARD_RECIPES = [
    {
        "title": "토마토파스타",
        "description": "토마토소스와 마늘, 양파를 기본으로 만드는 가장 표준적인 토마토 파스타입니다.",
        "ingredients": [
            "스파게티면 100g",
            "토마토소스 1컵 (200ml)",
            "양파 1/4개",
            "마늘 2쪽",
            "올리브오일 1큰술",
            "면 삶는 물 1L",
            "소금 1작은술",
            "후춧가루 약간",
            "파마산 치즈 약간 (선택)",
        ],
        "steps": [
            "냄비에 물 1L와 소금 1작은술을 넣고 센 불에서 끓인다. 물이 팔팔 끓으면 스파게티면을 넣고 포장지에 적힌 시간보다 1분 짧게 삶는다.",
            "면을 삶는 동안 양파는 잘게 다지고, 마늘은 얇게 썬다. 처음 요리한다면 재료를 미리 썰어 접시에 따로 두면 볶는 중간에 당황하지 않는다.",
            "팬에 올리브오일 1큰술을 두르고 약불에서 마늘을 30초 정도 볶는다. 마늘이 갈색으로 타기 시작하면 쓴맛이 나니 연한 노란빛일 때 양파를 넣는다.",
            "양파를 넣고 중불에서 2분 정도 볶는다. 양파가 투명해지고 매운 냄새가 줄어들면 토마토소스를 넣을 준비가 된 것이다.",
            "토마토소스 1컵을 붓고 중약불에서 3분 끓인다. 소스가 튀면 불을 조금 낮추고, 너무 되직하면 면 삶은 물을 2~3큰술 넣어 농도를 맞춘다.",
            "삶은 면을 팬에 넣고 소스와 1분 정도 섞는다. 면에 소스가 골고루 묻고 팬 바닥에 물기가 흥건하지 않으면 완성에 가깝다.",
            "불을 끄고 후춧가루를 약간 뿌린다. 원하면 파마산 치즈를 조금 올리고, 싱거우면 소금을 아주 조금씩 넣어 맛을 맞춘다.",
        ],
        "calories": 430,
        "difficulty": 2,
        "cooking_time": 25,
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500",
    },
    {
        "title": "크림파스타",
        "description": "우유와 생크림을 사용해 부드럽고 고소하게 만드는 기본 크림 파스타입니다.",
        "ingredients": [
            "스파게티면 100g",
            "생크림 1/2컵 (100ml)",
            "우유 1/2컵 (100ml)",
            "베이컨 2줄 또는 양송이버섯 3개",
            "양파 1/4개",
            "마늘 2쪽",
            "버터 1큰술",
            "면 삶는 물 1L",
            "소금 1작은술",
            "후춧가루 약간",
            "파마산 치즈 1큰술 (선택)",
        ],
        "steps": [
            "냄비에 물 1L와 소금 1작은술을 넣고 센 불에서 끓인다. 물이 끓으면 스파게티면을 넣고 포장지에 적힌 시간보다 1분 짧게 삶는다.",
            "면을 삶는 동안 양파는 잘게 다지고, 마늘은 얇게 썬다. 베이컨은 1cm 폭으로 자르고, 버섯을 쓴다면 얇게 썰어 준비한다.",
            "팬에 버터 1큰술을 넣고 약불에서 녹인 뒤 마늘을 30초 볶는다. 마늘이 갈색으로 타면 쓴맛이 나므로 향이 올라오는 정도에서 멈춘다.",
            "베이컨과 양파를 넣고 중불에서 2~3분 볶는다. 베이컨 가장자리가 살짝 바삭해지고 양파가 투명해지면 잘 볶아진 것이다.",
            "생크림과 우유를 붓고 중약불로 낮춘다. 끓어오르면 넘치기 쉬우니 가장자리에 작은 거품이 올라오는 정도로만 2분 끓인다.",
            "삶은 면을 넣고 1분 정도 섞는다. 소스가 너무 되직하면 면 삶은 물을 2큰술씩 넣어 부드럽게 풀고, 너무 묽으면 1분 더 끓인다.",
            "불을 끄고 후춧가루와 파마산 치즈를 넣어 섞는다. 크림소스는 식으면 더 되직해지므로 팬에서 살짝 묽다고 느껴질 때 접시에 담는 것이 좋다.",
        ],
        "calories": 620,
        "difficulty": 2,
        "cooking_time": 25,
        "image_url": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500",
    },
]


def upsert_standard_recipes():
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    try:
        for recipe in STANDARD_RECIPES:
            payload = (
                recipe["description"],
                json.dumps(recipe["ingredients"], ensure_ascii=False),
                json.dumps(recipe["steps"], ensure_ascii=False),
                recipe["calories"],
                recipe["difficulty"],
                recipe["cooking_time"],
                recipe["image_url"],
                recipe["title"],
            )
            cursor.execute("SELECT id FROM recipes WHERE title = %s", (recipe["title"],))
            existing = cursor.fetchone()
            if existing:
                cursor.execute(
                    """
                    UPDATE recipes
                    SET description = %s,
                        ingredients = %s,
                        steps = %s,
                        calories = %s,
                        difficulty = %s,
                        cooking_time = %s,
                        image_url = %s
                    WHERE title = %s
                    """,
                    payload,
                )
                print(f"갱신: {recipe['title']}")
            else:
                cursor.execute(
                    """
                    INSERT INTO recipes
                    (description, ingredients, steps, calories, difficulty, cooking_time, image_url, title, average_rating)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)
                    """,
                    payload,
                )
                print(f"삽입: {recipe['title']}")
        conn.commit()
        print("표준 레시피 보강 완료")
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    upsert_standard_recipes()
