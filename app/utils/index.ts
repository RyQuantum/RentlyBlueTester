export const MapUrl = [
  { name: 'Production', url: 'app2.keyless.rocks' },
  { name: 'Staging', url: 'keyless.rentlystaging.com' },
  { name: 'Opensesame', url: 'keyless.rentlyopensesame.com' },
  { name: 'Blue', url: 'keyless.bluerently.com' },
  { name: 'Red', url: 'keyless.rentlyred.com' },
  { name: 'Black', url: 'keyless.rentlyblack.com' },
  { name: 'Green', url: 'keyless.rentlygreen.com' },
  { name: 'QE', url: 'keyless.rentlyqe.com' },
  { name: 'Certify', url: 'keyless.rentlycertify.com' },
  { name: '192.168.2.8:3000', url: '192.168.2.8:3000' },
];

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const parseTimeStamp = (timestamp: string) => {
  const str = parseInt(timestamp, 16).toString(2).padStart(32, '0');
  const year = 2000 + parseInt(str.slice(0, 6), 2);
  const mon = parseInt(str.slice(6, 10), 2);
  const day = parseInt(str.slice(10, 15), 2);
  const hour = parseInt(str.slice(15, 20), 2);
  const min = parseInt(str.slice(20, 26), 2);
  const sec = parseInt(str.slice(26, 32), 2);

  return new Date(year, mon, day, hour, min, sec);
};

export const alertIOS = (...args: any[]) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      alert(...args);
    });
  });
};
