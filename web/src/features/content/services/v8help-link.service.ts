export class V8HelpLinkService {
  parseLink(link: string): { bookName: string; pagePath: string } | null {
    const v8helpRegex = /^v8help:\/\/([^/]+)\/(.+)$/;
    const match = link.match(v8helpRegex);
    
    if (!match) return null;
    
    return {
      bookName: match[1],
      pagePath: match[2],
    };
  }
}

export const v8helpLinkService = new V8HelpLinkService();
