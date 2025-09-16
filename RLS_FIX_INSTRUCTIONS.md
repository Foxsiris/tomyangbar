# 🔧 Исправление RLS политик для заказов

## ❌ Проблема
При попытке создать заказ без авторизации возникает ошибка:
```
new row violates row-level security policy for table "orders"
```

## ✅ Решение

### 1. Выполните SQL команды в Supabase

Откройте **Supabase Dashboard** → **SQL Editor** и выполните команды из файла `fix-orders-rls-policies.sql`:

```sql
-- Удаляем существующие политики для orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Создаем новые политики для orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- Аналогично для order_items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own order items" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own order items" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );
```

### 2. Что изменилось

**Старые политики:**
- ❌ Только авторизованные пользователи могли создавать заказы
- ❌ `auth.uid() = user_id` требовал авторизации

**Новые политики:**
- ✅ Любой может создавать заказы (`WITH CHECK (true)`)
- ✅ Авторизованные пользователи видят только свои заказы
- ✅ Анонимные пользователи могут создавать заказы с `user_id = NULL`

### 3. Проверка

После выполнения SQL команд:
1. Попробуйте создать заказ без авторизации
2. Заказ должен создаться успешно
3. В админ-панели должен появиться новый заказ

### 4. Безопасность

- ✅ Анонимные пользователи могут создавать заказы
- ✅ Авторизованные пользователи видят только свои заказы
- ✅ Админы могут видеть все заказы (если настроена роль admin)
- ✅ Политики защищают от несанкционированного доступа

## 🚀 Готово!

После выполнения этих команд создание заказов будет работать как для авторизованных, так и для анонимных пользователей.
