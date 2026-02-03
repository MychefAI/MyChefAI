-- 1) USERS
CREATE TABLE users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2) HEALTH_PROFILES (1:1 with users)
CREATE TABLE health_profiles (
  id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id              BIGINT NOT NULL UNIQUE,
  allergies            JSON NULL,
  chronic_conditions   JSON NULL,
  dietary_restrictions JSON NULL,
  medications          JSON NULL,
  goals                JSON NULL,
  CONSTRAINT fk_health_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3) MEAL_LOGS (1:N)
CREATE TABLE meal_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  record_date DATE NOT NULL,
  breakfast   VARCHAR(255) NULL,
  lunch       VARCHAR(255) NULL,
  dinner      VARCHAR(255) NULL,
  snacks      JSON NULL,
  CONSTRAINT fk_meal_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_meal_user_date (user_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4) FRIDGE_ITEMS (1:N)
CREATE TABLE fridge_items (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  name        VARCHAR(120) NOT NULL,
  quantity    VARCHAR(80) NULL,
  category    VARCHAR(80) NULL,
  expiry_date DATE NULL,
  CONSTRAINT fk_fridge_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_fridge_user (user_id),
  INDEX idx_fridge_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5) RECIPES
CREATE TABLE recipes (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  description    TEXT NULL,
  ingredients    JSON NOT NULL,
  steps          JSON NOT NULL,
  calories       INT NULL,
  difficulty     INT NULL,
  cooking_time   INT NULL,
  average_rating DOUBLE NOT NULL DEFAULT 0,
  image_url      VARCHAR(500) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipe_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6) RATINGS (user -> recipe)
CREATE TABLE ratings (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  recipe_id  BIGINT NOT NULL,
  score      INT NOT NULL,
  comment    TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rating_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rating_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON DELETE CASCADE,
  -- 한 사용자가 같은 레시피에 중복 평가 못하게
  UNIQUE KEY uk_rating_user_recipe (user_id, recipe_id),
  INDEX idx_rating_recipe (recipe_id),
  INDEX idx_rating_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7) RECIPE_SHARES (공유 기능)
CREATE TABLE recipe_shares (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  recipe_id     BIGINT NOT NULL,
  visibility    ENUM('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  share_message VARCHAR(300) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_share_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_share_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON DELETE CASCADE,
  INDEX idx_share_recipe (recipe_id),
  INDEX idx_share_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 8) RECIPE_STATS (인기 순위 집계용: 1:1 with recipes)
CREATE TABLE recipe_stats (
  recipe_id       BIGINT PRIMARY KEY,
  view_count      INT NOT NULL DEFAULT 0,
  like_count      INT NOT NULL DEFAULT 0,
  share_count     INT NOT NULL DEFAULT 0,
  last_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stats_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 9) RECOMMENDATIONS (사용자별 추천 결과 저장)
CREATE TABLE recommendations (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  recipe_id  BIGINT NOT NULL,
  score      DOUBLE NOT NULL,
  reason     VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reco_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reco_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON DELETE CASCADE,
  INDEX idx_reco_user (user_id, created_at),
  INDEX idx_reco_recipe (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 10) COMMUNITY_POSTS (사용자 작성 레시피 게시글)
CREATE TABLE community_posts (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  ingredients JSON NULL,
  steps       JSON NULL,
  image_url   VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_post_user (user_id),
  INDEX idx_post_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 11) POST_COMMENTS (게시글 댓글)
CREATE TABLE post_comments (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id    BIGINT NOT NULL,
  user_id    BIGINT NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_post
    FOREIGN KEY (post_id) REFERENCES community_posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comment_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_comment_post (post_id),
  INDEX idx_comment_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 12) POST_LIKES (게시글 좋아요)
CREATE TABLE post_likes (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id    BIGINT NOT NULL,
  user_id    BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_like_post
    FOREIGN KEY (post_id) REFERENCES community_posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_like_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY uk_post_user_like (post_id, user_id),
  INDEX idx_like_post (post_id),
  INDEX idx_like_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
