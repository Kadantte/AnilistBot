import moment from 'moment';
import momentTz from 'moment-timezone';
import { LanguageRequest, NotifyRequests, TimeRequest, UserRequest } from 'telegraf-bot-typings';
import { parseTimezone } from 'telegraf-parse';
import { IHandleCountdown, IHandleCounter, IHandleLanguage, IHandleMedia, IHandleNotify, IHandleTime, IHandleUser, IHandleUserData,
ITimeFormat } from '.';
import { fetchCounterInfo } from '../../database/counter/counter';
import { IDBUserInfo } from '../../database/user';
import { fetchUserAnime, fetchUserManga, userInfo, userLanguage, userSetNotification, userSetTime } from '../../database/user/user';
import { errorDate } from '../../database/utils';
import { getLanguageCode } from './language';
import { handleAnime, handleCountdownData, handleManga } from './media';

const handleTime = async ({ id, value, request, translation }: IHandleTime): Promise<string> => {
    if ('AM' === request || 'PM' === request) {
        return translation.t('timeHourOptions');
    } if ('PERIOD' === request) {
        return translation.t('timePeriodOptions');
    } if (null === value) {
        return translation.t('timeOptions');
    }

    return userSetTime({ time: value, id })
           .then(date => (errorDate !== date) ? translation.t('setHour', { hour: moment(date).hour() }) : translation.t('errorSetHour'))
           .catch(() => translation.t('errorSetHour'));
};

const handleNotify = async ({ id, value, translation }: IHandleNotify): Promise<string> => {
    if (null === value) {
        return translation.t('notifyOptions');
    }

    return userSetNotification({ notify: ('ENABLE' === value) ? true : false, id })
           .then(notify => translation.t('setNotify', { notify: (true === notify) ? translation.t('enabled') : translation.t('disabled') }))
           .catch(() => translation.t('errorNotify'));
};

const handleLanguage = async ({ id, value, translation }: IHandleLanguage): Promise<string> => {
    if (null === value) {
        return translation.t('languageOptions');
    }

    return userLanguage({ language: getLanguageCode(value), id })
        .then(() => translation.t('setLanguage'))
        .catch(() => translation.t('errorSetLanguage'));
};

const timeFormat = ({ time, timezone, translation }: ITimeFormat): string => {
    if (null === time) {
        return translation.t('timeNotSet');
    } if (null !== timezone) {
        return `${momentTz(time).tz(timezone).hour()}h`;
    }

    return `${moment(time).hour()}h`;
};

const handleUserData = async ({ id, translation }: IHandleUserData): Promise<string> => userInfo(id).then(info => {
    const { notify, language, time, timezone } = <IDBUserInfo> info;

    return translation.t('userOptions', {
        time: timeFormat({ time, timezone, translation }),
        notify: (true === notify) ? translation.t('enabled') : translation.t('disabled'),
        language: ('' !== language) ? translation.t(language) : translation.t('languageDefault'),
        timezone: (null !== timezone) ? parseTimezone(timezone) : translation.t('timezoneNotSet')
    });
}).catch(() => translation.t('errorUserInfo'));

export const handleCounter = async ({ id, user, translation }: IHandleCounter): Promise<string> => {
    user.anime = (undefined !== user.anime) ? user.anime : await fetchUserAnime(id);
    const time = await Promise.all(user.anime.map(async ({ content_id }) => fetchCounterInfo(content_id)));
    const counter = time.reduce((acc, cur) => acc + cur, 0) / 60;

    return translation.t('counterOptions', { counter });
};

export const handleMedia = async ({ id, user, filter, list, translation }: IHandleMedia): Promise<string> => {
    if ('WATCH' === list) {
        user.anime = (undefined !== user.anime) ? user.anime : await fetchUserAnime(id);

        return handleAnime({ user: user.anime, filter, translation });
    }
    user.manga = (undefined !== user.manga) ? user.manga : await fetchUserManga(id);

    return handleManga({ user: user.manga, filter, translation });
};

export const handleUser = async ({ id, value, request, translation }: IHandleUser): Promise<string> => {
    if ('ALL' === <UserRequest> request) {
        return handleUserData({ id, translation });
    } if ('NOTIFY' === <UserRequest> request) {
        return handleNotify({ value: <NotifyRequests> value, id, translation });
    } if ('LANGUAGE' === <UserRequest> request) {
        return handleLanguage({ value: <LanguageRequest> value, id, translation });
    }

    return handleTime({ value: <number> value, request: <TimeRequest> request, id, translation });
};

export const handleCountdown = async ({ id, user, translation }: IHandleCountdown): Promise<string> => {
    user.anime = (undefined !== user.anime) ? user.anime : await fetchUserAnime(id);

    return handleCountdownData({ user: user.anime, translation });
};
