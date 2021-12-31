import React from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

import Section from "./section";
import Subsection from "./subsection";

import {
  AccountId,
  AlertPanel,
  ApiToken,
  ExternalLink,
  Loading,
} from "./index";

const machine = Machine({
  id: "fork",
  initial: "initial",
  states: {
    initial: {
      on: {
        HAS_ACCOUNT: "form",
      },
    },
    form: {
      on: {
        VERIFYING: "verifying",
      },
    },
    verifying: {
      on: {
        VERIFIED: "verified",
        ERROR: "error",
      },
    },
    verified: {
      type: "final",
    },
    error: {
      on: {
        VERIFYING: "verifying",
      },
    },
  },
});

export default ({
  accountIdState: [accountId, setAccountId],
  apiTokenState: [apiToken, setApiToken],
  emailState: [email, setEmail],
  workerNameState: [workerName, setWorkerName],
  jwtWhitelistState: [jwtWhitelist, setJwtWhitelist],
  complete,
  current,
}) => {
  const [subcurrent, send] = useMachine(machine);

  const submit = async (event) => {
    event.preventDefault();
    send("VERIFYING");

    try {
      const resp = await fetch(`/verify`, {
        method: "POST",
        body: JSON.stringify({
          accountId,
          apiToken,
          email,
        }),
      });

      if (resp.status !== 200) {
        throw new Error(await resp.text());
      }

      send("VERIFIED");
      setAccountId(accountId);
      setApiToken(apiToken);
      setEmail(email);
      const _workerName = workerName.replace(/\s+/g, '-').toLowerCase();
      setWorkerName(_workerName);
      setJwtWhitelist(jwtWhitelist);
      complete();
    } catch (err) {
      console.error(err);
      send("ERROR");
    }

    return false;
  };

  return (
    <Section
      currentState={current}
      state="configuring"
      title="Configure Cloudflare Account"
      stepNumber={2}
      active={
        <>
          <Subsection
            title="Use an existing Cloudflare account or create a new one"
            active={subcurrent.value === "initial"}
            past={subcurrent.value !== "initial"}
          >
            <div>
              <p className="mb-4">
                Note: After creating an account, return here to continue.
              </p>
              <div className="flex space-x-4">
                <>
                  <button
                    className="bg-blue-4 py-2 px-4 rounded-md text-white mr-4"
                    onClick={() => send("HAS_ACCOUNT")}
                  >
                    I have an account
                  </button>
                  <a
                    className="border-2 border-blue-4 flex items-center justify-content text-blue-4 py-2 px-4 rounded-md"
                    href="https://dash.cloudflare.com/sign-up/workers"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="mr-2">Create account</span>
                    <ExternalLink />
                  </a>
                </>
              </div>
            </div>
          </Subsection>
          <Subsection
            title="Add account information"
            active={subcurrent.value !== "initial"}
          >
            <form onSubmit={submit}>
              <div className="mb-4">
                <p className="mb-2">
                  Enter your{" "}
                  <a
                    href="https://developers.cloudflare.com/workers/quickstart#account-id-and-zone-id"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Account ID and an Global API Token
                  </a>{" "}.
                </p>
              </div>
              <div className="flex">
                <div className="mr-8">
                  <label
                    htmlFor="account_id"
                    class="block font-medium leading-5 text-gray-1"
                  >
                    Account ID
                  </label>
                  <div class="mt-1 mb-6 relative">
                    <input
                      id="account_id"
                      class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                      onChange={({ target: { value } }) => setAccountId(value)}
                      placeholder="Cloudflare Workers Account ID"
                      required
                      value={accountId || ""}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="api_token"
                    class="block font-medium leading-5 text-gray-1"
                  >
                    Global API Token
                  </label>
                  <div class="mt-1 mb-6 relative">
                    <input
                      id="api_token"
                      class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                      onChange={({ target: { value } }) => setApiToken(value)}
                      placeholder="Cloudflare Workers Global API Token"
                      required
                      type="password"
                      value={apiToken || ""}
                    />
                  </div>
                </div>
              </div>

              {/* ============ Additional info for Lit-CloudFlare ============ */}

              {/* ==== ROW 1 ==== */}
              <div className="flex">

                  {/* ----- Email ----- */}
                  <div className="mr-8">
                    <label
                      htmlFor="account_id"
                      class="block font-medium leading-5 text-gray-1"
                    >
                      Email
                    </label>
                    <div class="mt-1 mb-6 relative">
                      <input
                        id="account_id"
                        class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                        onChange={({ target: { value } }) => setEmail(value)}
                        placeholder="Cloudflare Workers Email"
                        required
                        value={email || ""}
                      />
                    </div>
                  </div>

                  {/* ----- Worker Name ----- */}
                  <div className="mr-8">
                    <label
                      htmlFor="account_id"
                      class="block font-medium leading-5 text-gray-1"
                    >
                      Worker Name
                    </label>
                    <div class="mt-1 mb-6 relative">
                      <input
                        id="account_id"
                        class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                        onChange={({ target: { value } }) => setWorkerName(value)}
                        placeholder="<WORKER_NAME>-username.workers.dev"
                        required
                        value={workerName || ""}
                      />
                    </div>
                  </div>
              </div>

              {/* ==== ROW 2 ==== */}
              <div className="flex">

                  {/* ----- Jwt Whitelist ----- */}
                  <div className="mr-8">
                    <label
                      htmlFor="account_id"
                      class="block font-medium leading-5 text-gray-1"
                    >
                      Addtional Lit-JWT whitelist (Optional)
                    </label>
                    <div class="mt-1 mb-6 relative">
                      <input
                        id="account_id"
                        class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                        onChange={({ target: { value } }) => setJwtWhitelist(value)}
                        placeholder="localhost, 127.0.0.1, etc."
                        value={jwtWhitelist || ""}
                      />
                    </div>
                  </div>

              </div>

              {/* ============ ...Additional info for Lit-CloudFlare ============ */}

              <div class="mt-6 mb-4 flex items-center">
                <span class="block mr-4">
                  <button
                    type="submit"
                    disabled={subcurrent.value === "verifying"}
                    className={`${
                      subcurrent.value === "verifying"
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    } flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out`}
                  >
                    Connect account
                  </button>
                </span>

                {subcurrent.value === "verifying" && <Loading />}
              </div>

              {subcurrent.value === "error" ? (
                <AlertPanel>
                  <span>
                    Account ID or Global API Token are not valid.
                  </span>
                </AlertPanel>
              ) : (
                <div className="mb-6" />
              )}
            </form>
          </Subsection>
        </>
      }
      inactive={null}
      completed={
        <div>
          <p>
            <strong>Account ID:</strong> {accountId}
          </p>
        </div>
      }
    />
  );
};
