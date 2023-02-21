import axios from "axios";
import { HTTP_CODES, SessionToken, UserCredentials } from "../app/Models/ServerModels";
import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";

axios.defaults.validateStatus = () => {
	return true;
};

const serverUrl = "http://localhost:8080";
const itestUserCredentials: UserCredentials = {
	accessRights: [1, 2, 3],
	username: "iTestUser",
	password: "iTestPassword",
};

describe("Server itest suite", () => {
	let sessionToken: SessionToken;
	let userCredentialsDBAccess: UserCredentialsDbAccess;

	beforeAll(() => {
		userCredentialsDBAccess = new UserCredentialsDbAccess();
	});

	test("server reachable", async () => {
		const response = await axios.options(serverUrl);
		expect(response.status).toBe(HTTP_CODES.OK);
	});

	test.skip("put credentials inside database", async () => {
		await userCredentialsDBAccess.putUserCredential(itestUserCredentials);
	});

	test("reject invalid credentials", async () => {
		const response = await axios.post(serverUrl + "/login", {
			username: "someWrongCred",
			password: "someWrongCred",
		});
		expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
	});

	test("login successful with correct credentials", async () => {
		const response = await axios.post(serverUrl + "/login", {
			username: itestUserCredentials.username,
			password: itestUserCredentials.password,
		});
		expect(response.status).toBe(HTTP_CODES.CREATED);
		sessionToken = response.data;
	});

	test("query data", async () => {
		const response = await axios.get(serverUrl + "/users?name=some", {
			headers: {
				Authorization: sessionToken.tokenId,
			},
		});
		expect(response.status).toBe(HTTP_CODES.OK);
	});

	test("query data with invalid token", async () => {
		const response = await axios.get(serverUrl + "/users?name=some", {
			headers: {
				Authorization: sessionToken.tokenId + "someStuff",
			},
		});
		expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
	});
});

async function serverReachable(): Promise<boolean> {
	try {
		await axios.get(serverUrl);
	} catch (err) {
		console.log("Server not reachable");
		return false;
	}
	console.log("Server reachable");
	return true;
}
