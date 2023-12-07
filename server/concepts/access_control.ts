import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { idsAreEqual } from "../parser";
import { NotAllowedError } from "./errors";
import ParentConcept, { ParentShipDoc } from "./parentship";

export interface PublicityDoc extends BaseDoc {
  content: ObjectId;
}

/**
 * purpose: To make it possible for giving permissions involving user-created content to trusted users
 *
 * principle: A user who is granted with access to some content can view the content and navigate to it within the
 *  application
 */
export default class AccessControlConcept {
  public readonly accessControls: ParentConcept;
  private readonly publicContent: DocCollection<PublicityDoc>;

  public constructor(contentType: string) {
    this.accessControls = new ParentConcept(`${contentType}_access_controls`); // if the content is not public, `user` has access to `content` iff `user` is parent of `content`
    this.publicContent = new DocCollection<PublicityDoc>(`public_${contentType}`); // all users have access to `content` if `publicityDoc.content  == content` for some publicityDoc in this collection
  }

  /**
   * Grant's `user` permissions to access `userContent`; Can only be called if `userContent` is not already public.
   *
   *
   * @param user the id of an existing user
   * @param userContent the id of an existing piece of user content
   * @returns a user-directed message indicating that the access was granted
   */
  async putAccess(user: ObjectId, userContent: ObjectId) {
    if (await this.isPublic(userContent)) throw new NotAllowedError("Cannot control per-user access if content is public");
    await this.accessControls.putParentship({ child: userContent, parent: user });

    return { msg: "User was granted access!" };
  }

  /**
   * Makes it so that no user has permissions to access the object with id `userContent`
   *
   * @param userContent id of existing content
   */
  async setPrivate(userContent: ObjectId) {
    await this.accessControls.orphan(userContent);
    await this.publicContent.deleteMany({ content: userContent });
    return { msg: "Content is now private" };
  }

  /**
   * Idempotent; gives to all users permissions to access the content with object id `userContent`
   * @param userContent
   */
  async setPublic(userContent: ObjectId) {
    const contentIsPublic: boolean = await this.isPublic(userContent);
    if (contentIsPublic) return;
    await this.publicContent.createOne({ content: userContent });
    return { msg: "Content is now public" };
  }

  /**
   * Idempotent; Makes the user content non-public i.e. allows per-user access controls (existing per-user access controls also take effect)
   * @param userContent
   */
  async setRestricted(userContent: ObjectId) {
    await this.publicContent.deleteMany({ content: userContent });
    return { msg: "Content access for users must now be explicitly set" };
  }

  /**
   *
   * @param userContent
   * @returns  True if `userContent` is marked as being public; false otherwise
   */
  async isPublic(userContent: ObjectId): Promise<boolean> {
    const existingPublic: PublicityDoc[] = await this.publicContent.readMany({ content: userContent });
    return existingPublic.length != 0;
  }

  /**
   * Ensures `user` has no permissions to access `userContent.` Cannot be called if userContent is public.
   *
   *
   * @param user the id of an existing user, whose access should be removed
   * @param userContent the id of an existing piece of user content
   * @param contentAurthor the id of a user whose access should not be allowed to be removed
   * @returns a user-directed message indicating that the access was removed
   */
  async removeAccess(user: ObjectId, userContent: ObjectId, contentAuthor: ObjectId) {
    if (await this.isPublic(userContent)) throw new NotAllowedError("Cannot control per-user access if content is public");
    if (idsAreEqual(user, contentAuthor)) throw new NotAllowedError("Cannot remove access of author");
    await this.accessControls.deleteRelationship(userContent, user);
    return { msg: "Successfully revoked User's access from this content." };
  }

  public async canAccess(user: ObjectId, userContent: ObjectId): Promise<boolean> {
    const existing: ParentShipDoc[] = await this.accessControls.getParentships({ child: userContent, parent: user }); // TODO: run both at same time
    const existingPublic: PublicityDoc[] = await this.publicContent.readMany({ content: userContent });
    if (existing.length != 0 || existingPublic.length != 0) return true;
    return false;
  }

  async assertHasAccess(user: ObjectId, userContent: ObjectId): Promise<void> {
    const canAccess = await this.canAccess(user, userContent);
    if (!canAccess) {
      throw new NotAllowedError("The user does not have access to this content.");
    }
  }

  /**
   *
   * @returns the Ids of all instances of user-created content that are pub
   */
  async getPublicContent() {
    const publicColl = await this.publicContent.readMany({});
    const collectionIds = publicColl.map(({ content }) => content);
    return collectionIds;
  }

  /**
   *
   * @param user
   * @returns a list of the ids of content that was shared explicitly with the user
   */
  async getContentSharedWithUser(user: ObjectId): Promise<Array<ObjectId>> {
    const accessibleContent: ObjectId[] = await this.accessControls.getAllChildren(user);
    return accessibleContent;
  }

  /**
   *
   * @param userContent
   * @returns the ids of users who have been explicitly given access to the content
   */
  async getUsersWithRestrictedAccess(userContent: ObjectId): Promise<Array<ObjectId>> {
    return this.accessControls.getAllParents(userContent);
  }
}
