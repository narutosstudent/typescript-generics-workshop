import { it } from "vitest";
import { Equal, Expect } from "../helpers/type-utils";

export const returnWhatIPassIn = <StringType extends string>(
  t: StringType
): StringType => t;

it("Should ONLY allow strings to be passed in", () => {
  const a = returnWhatIPassIn("a");

  // generic must be of a certain type

  type test1 = Expect<Equal<typeof a, "a">>;

  // @ts-expect-error
  returnWhatIPassIn(1);

  // @ts-expect-error
  returnWhatIPassIn(true);

  // @ts-expect-error
  returnWhatIPassIn({
    foo: "bar",
  });
});
