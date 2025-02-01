// Устанавливаем дату события
var eventDate = new Date('2025-07-12T15:30:00');

// Функция для обновления отсчета
function updateCountdown() {
  var now = new Date(); // Текущее время
  var timeRemaining = eventDate - now; // Разница во времени

  // Если время прошло, останавливаем таймер
  if (timeRemaining <= 0) {
    document.getElementById("days").textContent = "0";
    document.getElementById("hours").textContent = "0";
    document.getElementById("minutes").textContent = "0";
    document.getElementById("seconds").textContent = "0";
    return; // Выход из функции
  }

  // Вычисляем количество дней, часов, минут и секунд
  var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Обновляем элементы на странице
  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}

// Обновляем отсчет каждую секунду
setInterval(updateCountdown, 1000);

// Вызов функции для начальной загрузки
updateCountdown();
