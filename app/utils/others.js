export const delay = ms => new Promise(res => setTimeout(res, ms));

export const parseTimeStamp = timestamp => {
  const str = parseInt(timestamp, 16).toString(2).padStart(32, '0');
  const year = 2000 + parseInt(str.slice(0, 6), 2);
  const mon = parseInt(str.slice(6, 10), 2);
  const day = parseInt(str.slice(10, 15), 2);
  const hour = parseInt(str.slice(15, 20), 2);
  const min = parseInt(str.slice(20, 26), 2);
  const sec = parseInt(str.slice(26, 32), 2);

  const time = new Date(year, mon, day, hour, min, sec);
}
