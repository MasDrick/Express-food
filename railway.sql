-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: ballast.proxy.rlwy.net:49231
-- Время создания: Май 08 2025 г., 17:43
-- Версия сервера: 9.3.0
-- Версия PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `railway`
--

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `name`, `image_url`) VALUES
(1, 'Итальянская', 'https://example.com/images/italian.jpg'),
(2, 'Японская', 'https://example.com/images/japanese.jpg'),
(3, 'Американская', 'https://example.com/images/american.jpg'),
(4, 'Грузинская', 'https://example.com/images/georgian.jpg'),
(5, 'Веганская', 'https://example.com/images/vegan.jpg'),
(6, 'Стейк-хаус', 'https://example.com/images/steakhouse.jpg'),
(7, 'Рыбная', 'https://example.com/images/seafood.jpg'),
(8, 'Азиатская', 'https://example.com/images/asian.jpg'),
(9, 'Европейская', 'https://example.com/images/european.jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `price` int NOT NULL,
  `weight` varchar(20) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `menu_items`
--

INSERT INTO `menu_items` (`id`, `restaurant_id`, `name`, `price`, `weight`) VALUES
(1, 1, 'Пицца Маргарита', 600, '350 г'),
(2, 1, 'Лазанья', 750, '450 г'),
(3, 1, 'Тирамису', 400, '200 г'),
(4, 1, 'Спагетти Карбонара', 800, '300 г'),
(5, 2, 'Филадельфия', 500, '250 г'),
(6, 2, 'Калифорния', 450, '200 г'),
(7, 2, 'Ролл с угрем', 600, '300 г'),
(8, 2, 'Мисо суп', 300, '250 г'),
(9, 3, 'Чизбургер', 400, '300 г'),
(10, 3, 'Бургер с беконом', 500, '350 г'),
(11, 3, 'Картофель фри', 200, '150 г'),
(12, 3, 'Шоколадный молочный коктейль', 300, '400 мл'),
(13, 4, 'Паста с морепродуктами', 900, '400 г'),
(14, 4, 'Цезарь с креветками', 650, '350 г'),
(15, 4, 'Пицца Пепперони', 700, '450 г'),
(16, 4, 'Брускетта', 400, '200 г'),
(17, 5, 'Хинкали', 500, '500 г'),
(18, 5, 'Хачапури по-аджарски', 600, '350 г'),
(19, 5, 'Шашлык из свинины', 800, '400 г'),
(20, 5, 'Лобио', 450, '300 г'),
(21, 6, 'Веганский бургер', 550, '300 г'),
(22, 6, 'Салат с киноа', 450, '250 г'),
(23, 6, 'Тофу с овощами', 600, '350 г'),
(24, 6, 'Зеленый смузи', 350, '400 мл'),
(25, 7, 'Стейк Рибай', 1500, '500 г'),
(26, 7, 'Говяжьи ребрышки', 1200, '600 г'),
(27, 7, 'Картофель пюре', 300, '200 г'),
(28, 7, 'Салат Цезарь', 450, '300 г'),
(29, 8, 'Пенне с соусом аррабиата', 600, '350 г'),
(30, 8, 'Феттучини с грибами', 700, '400 г'),
(31, 8, 'Ризотто с трюфелем', 850, '300 г'),
(32, 8, 'Пицца Четыре сыра', 750, '450 г'),
(33, 9, 'Уха', 450, '350 г'),
(34, 9, 'Жареная рыба с картофелем', 900, '500 г'),
(35, 9, 'Севиче', 700, '300 г'),
(36, 9, 'Креветки на гриле', 850, '400 г');

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(6,2) NOT NULL,
  `status` enum('pending','processing','delivering','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `comment` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `delivery_fee`, `status`, `address`, `phone`, `created_at`, `updated_at`, `comment`) VALUES
(15, 20, 1650.00, 150.00, 'pending', 'Пермь, Клары Цеткин 25', '+7 (982) 258-52-23', '2025-04-20 04:36:19', '2025-04-20 04:44:44', 'Домофон не работает, пожалуйста, позвоните!'),
(16, 20, 1500.00, 150.00, 'pending', 'Пермь, Клары Цеткин 25', '+7 (982) 258-52-23', '2025-04-20 04:53:36', '2025-04-20 04:53:36', 'ljvjajy yt hj,bn ,kznmфыва'),
(17, 20, 1500.00, 150.00, 'pending', 'Пермь, Клары Цеткин 25', '+7 (982) 258-52-23', '2025-04-20 04:54:55', '2025-04-20 04:54:55', 'ljvjajy yt hj,bn ,kznmфыва'),
(18, 20, 9700.00, 150.00, 'pending', 'Лоскутова 20', '+7 (982) 258-52-23', '2025-04-20 05:34:18', '2025-04-20 05:34:18', 'Домофон ен работает');

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `item_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `restaurant_id`, `menu_item_id`, `quantity`, `price`, `item_name`) VALUES
(58, 15, 1, 2, 2, 750.00, 'Лазанья'),
(59, 16, 2, 6, 3, 450.00, 'Калифорния'),
(60, 17, 2, 6, 3, 450.00, 'Калифорния'),
(61, 18, 1, 1, 3, 600.00, 'Пицца Маргарита'),
(62, 18, 1, 2, 5, 750.00, 'Лазанья'),
(63, 18, 1, 3, 4, 400.00, 'Тирамису'),
(64, 18, 1, 4, 3, 800.00, 'Спагетти Карбонара');

-- --------------------------------------------------------

--
-- Структура таблицы `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `status` enum('pending','processing','delivering','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `created_at`) VALUES
(10, 15, 'pending', '2025-04-20 04:36:20'),
(11, 16, 'pending', '2025-04-20 04:53:36'),
(12, 17, 'pending', '2025-04-20 04:54:55'),
(13, 18, 'pending', '2025-04-20 05:34:19');

-- --------------------------------------------------------

--
-- Структура таблицы `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `rating` decimal(3,1) NOT NULL,
  `delivery_time` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `cuisine` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `distance` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `rating`, `delivery_time`, `cuisine`, `distance`, `image_url`) VALUES
(1, 'Траттория Франческо', 4.5, '30-45 мин', 'Итальянская, Европейская', '1.2 км', 'https://avatars.mds.yandex.net/get-altay/12594487/2a0000018fe97a87a3950dd2ec8d2368c60a/L'),
(2, 'Суши Вок', 4.7, '20-30 мин', 'Японская, Азиатская', '0.8 км', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/d4/50/11/caption.jpg?w=600&h=400&s=1'),
(3, 'Бургер Клаб', 4.3, '25-40 мин', 'Американская, Фастфуд', '1.5 км', 'https://avatars.mds.yandex.net/get-altay/11398069/2a00000190eed550637f6288055886f53ac9/L'),
(4, 'Тоскана', 4.9, '35-50 мин', 'Итальянская, Средиземноморская', '3.2 км', 'https://burobiz-a.akamaihd.net/uploads/images/85779/large_picceriya-kak-vid-biznesa.jpg'),
(5, 'Грузинский Двор', 4.6, '30-45 мин', 'Грузинская, Кавказская', '1.8 км', 'https://victoria-plaza.ru/upload/resize_cache/iblock/b5e/i61omzpbvqh901boqd9e35yxavxnin3l/870_502_1/Ph_AnnaBorodina-91.jpg'),
(6, 'Веган Хаб', 4.4, '20-35 мин', 'Веганская, Здоровая', '1.1 км', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/8e/0c/de/eat-vegan-live-long.jpg?w=600&h=-1&s=1'),
(7, 'Мясной Рай', 4.7, '45-60 мин', 'Стейк-хаус, Европейская', '2.5 км', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/8d/b1/a7/caption.jpg?w=900&h=500&s=1'),
(8, 'Паста Бар', 4.3, '25-40 мин', 'Итальянская, Паста', '1.3 км', 'https://avatars.mds.yandex.net/get-altay/11401274/2a0000018d98a35adf98f8e08b49ff45a131/L'),
(9, 'Рыбный День', 4.5, '30-50 мин', 'Рыбная, Европейская', '2.0 км', 'https://static.sobaka.ru/images/image/01/66/70/10/_normal.jpg?v=1679949572'),
(12, 'Токио Суши', 4.8, '25-35 мин', 'Японская, Суши', '1.3 км', 'https://gastro-norma.ru/upload/iblock/aa0/cululdp0sk7xsrspxaf80dmqcpb867g6.webp'),
(13, 'Сакура', 4.5, '30-40 мин', 'Японская, Азиатская', '2.1 км', 'https://bushido74.ru/wp-content/uploads/2019/08/rolly2-min.jpg'),
(14, 'Американ Гриль', 4.5, '25-40 мин', 'Американская, Барбекю', '1.9 км', 'https://dpru.obs.ru-moscow-1.hc.sbercloud.ru/images/article/2020/12/23/E8A0F76D-A875-4AF8-AF55-B7E9FE70E1BA.jpg'),
(15, 'Техас Бургер', 4.2, '20-35 мин', 'Американская, Фастфуд', '0.9 км', 'https://californiadiner.ru/catalog/legendarnaya-burger-bashnya.jpg'),
(16, 'Тбилиси', 4.7, '35-50 мин', 'Грузинская, Кавказская', '2.4 км', 'https://victoria-plaza.ru/upload/resize_cache/iblock/091/mh48gvfgwa3q0jphoeaql7xckf2447d6/870_502_1/Ph_AnnaBorodina-80.jpg'),
(17, 'Сациви', 4.5, '30-45 мин', 'Грузинская, Кавказская', '1.6 км', 'https://nownownow.ru/wp-content/uploads/2022/06/img_1244.jpg'),
(18, 'Зелёный Сад', 4.3, '25-40 мин', 'Веганская, Здоровая', '1.5 км', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/68/0a/1c/restaurant.jpg?w=600&h=-1&s=1'),
(19, 'Авокадо', 4.6, '20-35 мин', 'Веганская, Вегетарианская', '0.7 км', 'https://opis-cdn.tinkoffjournal.ru/mercury/vegetarian-moscow-5.pp7kokg96cfq.jpg'),
(20, 'Стейк Хаус', 4.8, '40-55 мин', 'Американская, Мясная', '2.8 км', 'https://inde.io/i/posts/8762/d584ff23f6b72413d8cfa7a1e8dd16af.jpg'),
(21, 'Мясной Бар', 4.6, '35-50 мин', 'Американская, Барбекю', '2.2 км', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/88/b8/16/caption.jpg?w=900&h=500&s=1'),
(22, 'Морская Волна', 4.7, '35-50 мин', 'Рыбная, Морепродукты', '2.3 км', 'https://restoranoff.ru/upload/iblock/842/restorany_s_moreproduktami.png'),
(23, 'Лагуна', 4.4, '30-45 мин', 'Рыбная, Средиземноморская', '1.8 км', 'https://cristal-resort.ru/templates/cristal-resort/img/articles/syrie-moreprodukty.jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `restaurant_categories`
--

CREATE TABLE `restaurant_categories` (
  `restaurant_id` int NOT NULL,
  `category_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `restaurant_categories`
--

INSERT INTO `restaurant_categories` (`restaurant_id`, `category_id`) VALUES
(1, 1),
(4, 1),
(8, 1),
(2, 2),
(12, 2),
(13, 2),
(3, 3),
(14, 3),
(15, 3),
(5, 4),
(16, 4),
(17, 4),
(6, 5),
(18, 5),
(19, 5),
(7, 6),
(20, 6),
(21, 6),
(9, 7),
(22, 7),
(23, 7),
(2, 8),
(13, 8),
(1, 9),
(4, 9),
(7, 9),
(9, 9),
(21, 9),
(23, 9);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_general_ci DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(18, 'MasDrick Solo', 'masdricksolo@mail.ru', '$2b$10$5xo7FIDIYdJ/gQ9npI5s6eMqpKdhm2aV2tKT4NScHkcaSmdfjUDz2', 'admin', '2025-04-01 17:50:49'),
(19, 'Юлия', 'jul@mail.ru', '$2b$10$GJCHFZ4jIS/cbqVH8XSpD.NvEg0Tzi3vrpITxZxuqhp6uIjaoY5pq', 'user', '2025-04-15 18:20:24'),
(20, 'MasDrick', 'maks@mail.ru', '$2b$10$V8rKtO/IN5maMCwC0KB.1eUlHLXMZG4X4yKYWpgUqWE.UPuCepuWS', 'admin', '2025-04-16 07:28:45'),
(21, 'Seratt', 'chuprinroma1301@yandex.ru', '$2b$10$O82ahRNRBbGpcg17SI2cFO6EURB.qosE37rW2VnA8Xh32SksAFWZe', 'user', '2025-04-16 07:32:09'),
(22, 'Seratt', 'chuprinroma1301@gmail.com', '$2b$10$VjTEruy0aMr8gp6ojMHxW.imxdD4lPsmAziaDVW/fH6uFAtwKHVUG', 'user', '2025-04-17 15:30:57'),
(23, 'Jonyxx', 'john@mail.ru', '$2b$10$dtz4GcHRs855aq9YIGObLeOppVX.EsnFmkfJUe4XiOxRVvt9BE1kq', 'user', '2025-04-19 13:04:38');

--
-- Триггеры `users`
--
DELIMITER $$
CREATE TRIGGER `after_user_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
  INSERT INTO `user_info` (`user_id`, `email`, `discount_percent`, `registration_date`)
  VALUES (NEW.id, NEW.email, 5.00, NEW.created_at);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Структура таблицы `user_info`
--

CREATE TABLE `user_info` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `card_number` varchar(19) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT '5.00',
  `registration_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orders_count` int DEFAULT '0',
  `profile_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `user_info`
--

INSERT INTO `user_info` (`id`, `user_id`, `email`, `phone`, `card_number`, `discount_percent`, `registration_date`, `orders_count`, `profile_image`) VALUES
(1, 18, 'masdricksolo@mail.ru', '+7 (982) 438-69-54', '2222222222222222', 5.00, '2025-04-01 17:50:49', 0, 'https://avatars.githubusercontent.com/u/143419810?v=4'),
(2, 19, 'jul@mail.ru', NULL, NULL, 5.00, '2025-04-15 18:20:24', 0, NULL),
(3, 20, 'maks@mail.ru', '+7 (982) 258-52-23', '1234567891234567', 10.00, '2025-04-16 07:28:45', 4, 'https://tiermaker.com/images/media/hero_images/2024/17017786/spike-skins-ranked-update-17017786/170177861712071272.png'),
(4, 21, 'chuprinroma1301@yandex.ru', NULL, NULL, 5.00, '2025-04-16 07:32:09', 0, NULL),
(5, 22, 'chuprinroma1301@gmail.com', NULL, NULL, 5.00, '2025-04-17 15:30:57', 0, NULL),
(6, 23, 'john@mail.ru', NULL, NULL, 5.00, '2025-04-19 13:04:38', 1, NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Индексы таблицы `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Индексы таблицы `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `restaurant_categories`
--
ALTER TABLE `restaurant_categories`
  ADD PRIMARY KEY (`restaurant_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Индексы таблицы `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT для таблицы `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT для таблицы `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT для таблицы `user_info`
--
ALTER TABLE `user_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`);

--
-- Ограничения внешнего ключа таблицы `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `restaurant_categories`
--
ALTER TABLE `restaurant_categories`
  ADD CONSTRAINT `restaurant_categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `restaurant_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
