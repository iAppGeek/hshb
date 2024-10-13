import type { ContentfulClientApi } from "contentful"
import { getRandomInt } from "./numbers";

export type CommunityMemeber = { name: string, blurb: string, photo: string }
export type CommunityDirectory = { [key: string]: CommunityMemeber[] }

const getLinkedAssetUrl = (parentNode: any) => {
    return "https:" + (parentNode["fields"]["file"]["url"] as string);
};

export const getTextSectionData = async (client: ContentfulClientApi<undefined>, sectionId: string) => {
    // get entry by "id" field
    const entriy = await client.getEntries({ content_type: "text", 'fields.id[match]': sectionId, limit: 1 });
    return entriy.items.length > 0 ? entriy.items[0].fields["text"] as string : "";
}

//gets a single random entry from all quotes
export const getFeaturedQuote = async (client: ContentfulClientApi<undefined>) => {
    // get total count of quote entries
    const entriesCount = await client.getEntries({ content_type: "quotes", limit: 0 })
    // get random number in range of total entry count
    const rdm = getRandomInt(entriesCount.total)
    // get the one entry
    const entry = await client.getEntries({ content_type: "quotes", limit: 1, skip: rdm })
    return { author: entry.items[0].fields["author"] as string, role: entry.items[0].fields["role"] as string, text: entry.items[0].fields["text"] as string, };
}

export const getCommunityDirectory = async (client: ContentfulClientApi<undefined>) => {
    const people = await client.getEntries({ content_type: "people" })
    const grouped = people.items.reduce((prev, curr) => {
        const role = curr.fields["role"] as string;
        const member: CommunityMemeber = {
            blurb: curr.fields["blurb"] as string,
            name: `${curr.fields["firstName"]} ${curr.fields["lastName"]}`,
            photo: getLinkedAssetUrl(curr.fields["photo"]),
        }

        if (prev[role]) {
            return { ...prev, [role]: prev[role].concat(member) }
        }
        else {
            return { ...prev, [role]: [member] }
        }
    }, {} as CommunityDirectory);

    return grouped;
}
