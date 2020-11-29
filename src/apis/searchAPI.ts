import axios from 'axios';

interface YoutubeApiData {
  videoId: string;
  title: Title;
}

interface Title {
  runs: TitleData[];
}

interface TitleData {
  text: string;
}

const SEARCH_BASE_URL = 'https://www.youtube.com/results?search_query=';
const WATCH_BASE_URL = 'https://www.youtube.com/watch?v=';

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, '+');
}

async function getData(searchURL: string) {
  const result = await axios.get(searchURL);
  return result.data;
}

function getIndex(data: string, start: number) {
  let startIndex, endIndex;
  let count = 0;
  for (let i = start; i < data.length; i++) {
    if (data[i] == '{') {
      startIndex = i;
      break;
    }
  }
  for (let i = startIndex; i < data.length; i++) {
    if (data[i] == '{') count++;
    else if (data[i] == '}') count--;
    if (count == 0) {
      endIndex = i;
      return [startIndex, endIndex + 1];
    }
  }
}

function getIndexes(data: string) {
  const dataBegin = /(var ytInitialData)|(window\["ytInitialData"\])/;
  const match = dataBegin.exec(data);
  const start = data.indexOf(match[0]);
  return getIndex(data, start);
}

function parseData(raw: string, start: number, end: number): YoutubeApiData {
  let data = JSON.parse(raw.substring(start, end));
  data =
    data.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents[0].itemSectionRenderer.contents;

  const result = data.reduce(
    (acc: [], curr: any) =>
      curr.videoRenderer ? [...acc, curr.videoRenderer] : acc,
    []
  );

  if (result.length < 1) return null;
  return result[0];
}

export async function ytsr(searchQuery: string) {
  searchQuery = normalizeQuery(searchQuery);
  let rawData = await getData(`${SEARCH_BASE_URL}${searchQuery}`);
  const [startIndex, endIndex] = getIndexes(rawData);

  const data = parseData(rawData, startIndex, endIndex);
  if (!data) return null;

  return {
    title: data.title.runs[0].text,
    url: `${WATCH_BASE_URL}${data.videoId}`,
  };
}
