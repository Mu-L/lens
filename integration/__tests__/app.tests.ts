/**
 * @jest-environment node
 */

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { listHelmRepositories } from "../helpers/utils";
import { fail } from "assert";

jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
describe("Lens integration tests", () => {
  let app: Application;

  describe("app start", () => {
    utils.beforeAllWrapped(async () => {
      app = await utils.appStart();
    });

    utils.afterAllWrapped(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    });

    it('shows "whats new"', async () => {
      await utils.clickWhatsNew(app);
    });

    it('shows "add cluster"', async () => {
      await app.electron.ipcRenderer.send("test-menu-item-click", "File", "Add Cluster");
      await app.client.waitUntilTextExists("h2", "Add Clusters from Kubeconfig");
    });

    describe("preferences page", () => {
      it('shows "preferences"', async () => {
        const appName: string = process.platform === "darwin" ? "Lens" : "File";

        await app.electron.ipcRenderer.send("test-menu-item-click", appName, "Preferences");
        await app.client.waitUntilTextExists("[data-testid=application-header]", "APPLICATION");
      });

      it("shows all tabs and their contents", async () => {
        await app.client.click("[data-testid=application-tab]");
        await app.client.click("[data-testid=proxy-tab]");
        await app.client.waitUntilTextExists("[data-testid=proxy-header]", "PROXY");
        await app.client.click("[data-testid=kube-tab]");
        await app.client.waitUntilTextExists("[data-testid=kubernetes-header]", "KUBERNETES");
        await app.client.click("[data-testid=telemetry-tab]");
        await app.client.waitUntilTextExists("[data-testid=telemetry-header]", "TELEMETRY");
      });

      it("ensures helm repos", async () => {
        const repos = await listHelmRepositories();

        if (!repos[0]) {
          fail("Lens failed to add Bitnami repository");
        }

        await app.client.click("[data-testid=kube-tab]");
        await app.client.waitUntilTextExists("div.repos .repoName", repos[0].name); // wait for the helm-cli to fetch the repo(s)
        await app.client.click("#HelmRepoSelect"); // click the repo select to activate the drop-down
        await app.client.waitUntilTextExists("div.Select__option", "");  // wait for at least one option to appear (any text)
      });
    });

    it.skip('quits Lens"', async () => {
      await app.client.keys(["Meta", "Q"]);
      await app.client.keys("Meta");
    });
  });
});
