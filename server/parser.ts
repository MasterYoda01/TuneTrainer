import { ObjectId } from "mongodb";
import { BadValuesError } from "./concepts/errors";

/**
 * @param input
 * @returns the provided input casted as object id;
 * if not possible, then a user-friendly message is returned;
 */
export function parseInputAsObjectId(input: string) {
  try {
    return new ObjectId(input);
  } catch (e) {
    throw new BadValuesError("Invalid id: does not follow proper format.");
  }
}

export function idsAreEqual(objId1: ObjectId, objId2: ObjectId) {
  return objId1.toString() === objId2.toString();
}
