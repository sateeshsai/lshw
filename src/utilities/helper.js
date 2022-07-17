export const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));

export const getDaysArray = function (start, end) {
  for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

export const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const subtractDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

//GET FIRST DAT OF THE WEEK
export function firstDayOfWeek(dateObject, firstDayOfWeekIndex) {
  const dayOfWeek = dateObject.getDay(),
    firstDayOfWeek = new Date(dateObject),
    diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

  firstDayOfWeek.setDate(dateObject.getDate() - diff);
  firstDayOfWeek.setHours(0, 0, 0, 0);

  return firstDayOfWeek;
}

//TO UPPER CASE
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//function to generate a 10 digit random number based on date and time
export function randomNumber() {
  let date = new Date();
  let time = date.getTime();
  let random = Math.floor(Math.random() * 10000000000);
  let randomNumber = time + random;
  return randomNumber;
}