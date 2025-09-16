-- Исправление RLS политик для корзин
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can manage own carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can manage session carts" ON carts;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can manage session cart items" ON cart_items;

-- Создаем новые политики для корзин
CREATE POLICY "Users can manage own carts" ON carts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create session carts" ON carts
    FOR INSERT WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can select session carts" ON carts
    FOR SELECT USING (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can update session carts" ON carts
    FOR UPDATE USING (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can delete session carts" ON carts
    FOR DELETE USING (session_id IS NOT NULL AND user_id IS NULL);

-- Создаем новые политики для элементов корзин
CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id = auth.uid()
        )
    );

CREATE POLICY "Anonymous users can create session cart items" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.session_id IS NOT NULL 
            AND carts.user_id IS NULL
        )
    );

CREATE POLICY "Anonymous users can select session cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.session_id IS NOT NULL 
            AND carts.user_id IS NULL
        )
    );

CREATE POLICY "Anonymous users can update session cart items" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.session_id IS NOT NULL 
            AND carts.user_id IS NULL
        )
    );

CREATE POLICY "Anonymous users can delete session cart items" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.session_id IS NOT NULL 
            AND carts.user_id IS NULL
        )
    );
