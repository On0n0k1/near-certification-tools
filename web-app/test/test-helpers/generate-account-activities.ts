import dayjs from 'dayjs';
import crypto from 'crypto'; // https://stackoverflow.com/a/27747377
import utc from 'dayjs/plugin/utc'; // https://day.js.org/docs/en/plugin/utc
import { convertStringDateToNanoseconds } from '../../helpers/time';

dayjs.extend(utc); // use dayjs utc plugin to avoid parsing different dates depending on local timezone.

type ActivityData = {
  signer_account_id: string;
  account_activities: {
    included_in_block_timestamp: string;
    receipt_id: string;
  }[];
};

export async function generateActivityData(data: ActivityData, startDate: string, endDate: string) {
  const startDateDayJs = dayjs.utc(startDate);
  const endDateDayJs = dayjs.utc(endDate);
  const duration = endDateDayJs.diff(startDateDayJs, 'days'); // amount of days between startDate and endDate

  // add activity every 5 days
  for (let i = 5; i < duration; i += 5) {
    const date = startDateDayJs.add(i, 'day').format('YYYY-MM-DDTHH:mm:ss+00:00');

    data.account_activities.push({
      included_in_block_timestamp: convertStringDateToNanoseconds(date),
      receipt_id: crypto.randomBytes(22.5).toString('hex'), // match receipt_id length convention of 45 chars. Using randomBytes, resulting string is double the size of given bytes in length.
    });
  }
}

// TODO: refactor function for other cases
// Creates activity data so that the expiration date calculation returns today's date one hour from now
export async function generateDynamicActivityData(data: ActivityData) {
  const startDateDayJs = dayjs.utc().subtract(180, 'day').subtract(6, 'hour');

  // add activity every 1 hour
  for (let i = 0; i <= 7; i += 1) {
    const date = startDateDayJs.add(i, 'hour').format('YYYY-MM-DDTHH:mm:ss+00:00');

    data.account_activities.push({
      included_in_block_timestamp: convertStringDateToNanoseconds(date),
      receipt_id: crypto.randomBytes(22.5).toString('hex'), // match receipt_id length convention of 45 chars. Using randomBytes, resulting string is double the size of given bytes in length.
    });
  }
}
