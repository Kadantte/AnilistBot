import { fetchData } from 'endeavor';
import { IAnilistContext, ISearchContext } from '.';
import { IMinimumInline } from '../../telegram/';
import { ICharacters, ICharactersQueryPage, IMedia, IMediaQueryPage, IStaff, IStaffQueryPage, IStudios, IStudiosQueryPage
} from '../queries';
import characters from '../queries/charactersSearch.gql';
import media from '../queries/mediaSearch.gql';
import staff from '../queries/staffSearch.gql';
import studio from '../queries/studioSearch.gql';
import { charactersInfo, mediaInfo, staffInfo, studiosInfo } from './info';

const searchAnilist = async ({ search, query, page, perPage }: IAnilistContext): Promise<Object | Error> => fetchData({
    query,
    variables: { page, perPage, search: ('' !== search) ? search : null  }
});

const staffSearch = async ({ search, page, perPage, translation }: ISearchContext): Promise<IMinimumInline[]> => {
    const searched = <IStaffQueryPage> await searchAnilist({ search, page, perPage, query: staff });
    const curriedStaffInfo = ((input: IStaff) => staffInfo({ staff: input, translation }));

    return searched.data.Page.staff.map(curriedStaffInfo);
};

const studiosSearch = async ({ search, page, perPage, translation }: ISearchContext): Promise<IMinimumInline[]> => {
    const searched = <IStudiosQueryPage> await searchAnilist({ search, page, perPage, query: studio });
    const curriedStudiosInfo = ((studios: IStudios) => studiosInfo({ studios, translation }));

    return searched.data.Page.studios.map(curriedStudiosInfo);
};

const charactersSearch = async ({ search, page, perPage, translation }: ISearchContext): Promise<IMinimumInline[]> => {
    const searched = <ICharactersQueryPage> await searchAnilist({ search, page, perPage, query: characters });
    const curriedCharactersInfo = ((input: ICharacters) => charactersInfo({ characters: input, translation }));

    return searched.data.Page.characters.map(curriedCharactersInfo);
};

const mediaSearch = async ({ search, page, perPage, translation }: ISearchContext): Promise<IMinimumInline[]> => {
    const searched = <IMediaQueryPage> await searchAnilist({ search, page, perPage, query: media });
    const curriedMediaInfo = ((input: IMedia) => mediaInfo({ media: input, translation }));

    return searched.data.Page.media.map(curriedMediaInfo);
};

// Needs A LOT of refactoring.
export const allSearch = async ({ search, page, perPage, translation }: ISearchContext): Promise<IMinimumInline[]> => {
    const total = await mediaSearch({ search, translation, page, perPage });

    if (total.length === perPage) {
        return total;
    }

    total.push(...await staffSearch({ search, translation, page, perPage: total.length - perPage }));

    if (total.length === perPage) {
        return total;
    }

    total.push(...await studiosSearch({ search, translation, page, perPage: total.length - perPage }));

    if (total.length === perPage) {
        return total;
    }

    total.push(...await charactersSearch({ search, translation, page, perPage: total.length - perPage }));

    return total;
};
