import { SessionToken } from "../app/Models/ServerModels";
import { SessionTokenDBAccess } from "../app/Authorization/SessionTokenDBAccess";

describe("SessionTokenDBAccess itest suite", () => {
	let somSessionToken: SessionToken;
	let sessionTokenDBAccess: SessionTokenDBAccess;
	const randomString = Math.random().toString(36).substring(7);

	beforeAll(() => {
		sessionTokenDBAccess = new SessionTokenDBAccess();
		somSessionToken = {
			accessRights: [1, 2, 3],
			expirationTime: new Date(),
			tokenId: "someTokenId" + randomString,
			userName: "someUserName",
			valid: true,
		};
	});

	test("store and retrieve SessionToken", async () => {
		await sessionTokenDBAccess.storeSessionToken(somSessionToken);
		const resultToken = await sessionTokenDBAccess.getToken(somSessionToken.tokenId);
		expect(resultToken).toMatchObject(somSessionToken);
	});

	test("delete sessionToken", async () => {
		await sessionTokenDBAccess.deleteToken(somSessionToken.tokenId);
		const resultToken = await sessionTokenDBAccess.getToken(somSessionToken.tokenId);
		expect(resultToken).toBeUndefined();
	});

	test("delete missing sessionToken throws error", async () => {
		try {
			await sessionTokenDBAccess.deleteToken(somSessionToken.tokenId);
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
			expect(err).toHaveProperty("message", "SessionToken not deleted");
		}
	});
});
