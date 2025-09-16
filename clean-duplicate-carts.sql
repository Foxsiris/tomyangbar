-- Очистка дублирующихся корзин
-- Выполните в Supabase SQL Editor

-- 1. Показываем текущее состояние
SELECT '=== ТЕКУЩЕЕ СОСТОЯНИЕ ===' as info;
SELECT session_id, COUNT(*) as count 
FROM carts 
WHERE user_id IS NULL 
GROUP BY session_id 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Показываем все корзины с session_id
SELECT '=== ВСЕ КОРЗИНЫ С SESSION_ID ===' as info;
SELECT id, session_id, user_id, created_at 
FROM carts 
WHERE session_id IS NOT NULL 
ORDER BY session_id, created_at;

-- 3. Очищаем дублирующиеся корзины
-- Оставляем только самую старую корзину для каждого session_id
WITH duplicate_carts AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC) as rn
  FROM carts 
  WHERE user_id IS NULL AND session_id IS NOT NULL
)
DELETE FROM carts 
WHERE id IN (
  SELECT id FROM duplicate_carts WHERE rn > 1
);

-- 4. Показываем результат
SELECT '=== РЕЗУЛЬТАТ ОЧИСТКИ ===' as info;
SELECT session_id, COUNT(*) as count 
FROM carts 
WHERE user_id IS NULL 
GROUP BY session_id 
ORDER BY count DESC;

-- 5. Показываем оставшиеся корзины
SELECT '=== ОСТАВШИЕСЯ КОРЗИНЫ ===' as info;
SELECT id, session_id, user_id, created_at 
FROM carts 
WHERE session_id IS NOT NULL 
ORDER BY session_id, created_at;
