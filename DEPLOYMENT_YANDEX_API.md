# Развертывание с поддержкой Yandex Maps API

## Что было исправлено

✅ **Проблема CORS решена** - созданы API endpoints на сервере для проксирования запросов к Yandex API

## Новые файлы

### API Endpoints:
- `api/yandex/suggest.js` - подсказки адресов
- `api/yandex/geocode.js` - геокодирование адресов

### Документация:
- `YANDEX_API_SETUP.md` - подробная инструкция по настройке

## Обновленные файлы

- `src/components/AddressAutocomplete.jsx` - теперь использует серверный API
- `vite.config.js` - убран прокси (не нужен для Vercel/Netlify)

## Настройка для развертывания

### 1. Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. В настройках проекта добавьте переменную окружения:
   - **Имя**: `YANDEX_MAPS_API_KEY`
   - **Значение**: ваш API ключ от Yandex Maps
3. Разверните проект

### 2. Netlify
1. Подключите репозиторий к Netlify
2. В настройках проекта добавьте переменную окружения:
   - **Имя**: `YANDEX_MAPS_API_KEY`
   - **Значение**: ваш API ключ от Yandex Maps
3. Разверните проект

## Проверка работы

После развертывания:
1. Перейдите на страницу с картой
2. Попробуйте ввести адрес в поле автокомплита
3. Убедитесь, что подсказки загружаются без ошибок

## API Endpoints

После развертывания будут доступны:
- `https://your-domain.vercel.app/api/yandex/suggest`
- `https://your-domain.vercel.app/api/yandex/geocode`

## Получение API ключа

1. [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Создайте проект
3. Включите API: JavaScript API, HTTP Геокодер, Поиск по организациям
4. Скопируйте API ключ
