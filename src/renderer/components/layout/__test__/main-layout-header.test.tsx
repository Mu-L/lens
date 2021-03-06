jest.mock("../../../../common/ipc");

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { MainLayoutHeader } from "../main-layout-header";
import { Cluster } from "../../../../main/cluster";

const cluster: Cluster = new Cluster({
  id: "foo",
  contextName: "minikube",
  kubeConfigPath: "minikube-config.yml",
});

describe("<MainLayoutHeader />", () => {
  it("renders w/o errors", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders cluster name", () => {
    const { getByText } = render(<MainLayoutHeader cluster={cluster} />);

    expect(getByText("minikube")).toBeInTheDocument();
  });
});
