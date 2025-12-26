-- Таблица для заявок на вакансии
CREATE TABLE IF NOT EXISTS vacancies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    work_experience INTEGER NOT NULL CHECK (work_experience >= 0),
    phone VARCHAR(20) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'contacted', 'rejected', 'hired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies(created_at);
CREATE INDEX IF NOT EXISTS idx_vacancies_phone ON vacancies(phone);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON vacancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

