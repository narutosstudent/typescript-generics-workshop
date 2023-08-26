import { expect, it } from "vitest";
import { Equal, Expect } from "../helpers/type-utils";

// Define a type for a row which has a required key (of type Key) and allows for any other properties.
type RowWithKey<Key extends string> = { [P in Key]: unknown } & Record<
  string,
  unknown
>;

// Define the `makeInfiniteScroll` function with a generic parameter Key that extends string.
const makeInfiniteScroll = <Key extends string>(params: {
  // Ensure the given key is of type Key.
  key: Key;
  // A function that fetches rows; these rows should have the required key.
  fetchRows: () => Promise<RowWithKey<Key>[]>;
  // An optional initial set of rows. They too should have the required key.
  initialRows?: RowWithKey<Key>[];
}): {
  // A function to trigger the fetch of more rows.
  scroll: () => Promise<void>;
  // A function to retrieve all fetched rows.
  getRows: () => RowWithKey<Key>[];
} => {
  // Define a mutable local array data to store fetched rows. Initialize with initialRows or an empty array.
  let data: RowWithKey<Key>[] = params.initialRows || [];

  // Define the scroll function, which fetches more rows and appends them to the data array.
  const scroll = async () => {
    // Fetch more rows using the provided fetchRows function.
    const rows = await params.fetchRows();
    // Append the fetched rows to the existing data array.
    data = [...data, ...rows];
  };

  // Return an object with the scroll function and the getRows function.
  return {
    // The scroll function fetches and appends more rows.
    scroll,
    // The getRows function simply returns the data array.
    getRows: () => data,
  };
};

it("Should fetch more data when scrolling", async () => {
  const table = makeInfiniteScroll({
    key: "id",
    fetchRows: () => Promise.resolve([{ id: 1, name: "John" }]),
  });

  await table.scroll();

  await table.scroll();

  expect(table.getRows()).toEqual([
    { id: 1, name: "John" },
    { id: 1, name: "John" },
  ]);
});

it("Should ensure that the key is one of the properties of the row", () => {
  makeInfiniteScroll({
    key: "name",
    fetchRows: () =>
      // @ts-expect-error
      Promise.resolve([
        {
          id: "1",
        },
      ]),
  });
});

it("Should allow you to pass initialRows", () => {
  const { getRows } = makeInfiniteScroll({
    key: "id",
    initialRows: [
      {
        id: 1,
        name: "John",
      },
    ],
    fetchRows: () => Promise.resolve([]),
  });

  const rows = getRows();

  expect(rows).toEqual([
    {
      id: 1,
      name: "John",
    },
  ]);

  type tests = [
    Expect<Equal<typeof rows, Array<{ id: number; name: string }>>>
  ];
});
