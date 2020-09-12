import { trackFocus } from "../dom";
import { Emitter } from "../events";
import { PanelApi } from "../panel/api";
import { CompositeDisposable } from "../lifecycle";
import { ReactLayout } from "./layout";
import { ReactPart } from "./react";
import { ISplitviewPanelProps } from "./splitview";
import { PanelUpdateEvent, InitParameters, IPanel } from "../panel/types";
import { IComponentGridview } from "../layout/componentGridview";

export class ReactComponentGridView
  extends CompositeDisposable
  implements IComponentGridview, IPanel {
  private _element: HTMLElement;
  private part: ReactPart;
  private params: { params: any };
  private api: PanelApi;

  private _onDidChange: Emitter<number | undefined> = new Emitter<
    number | undefined
  >();
  public onDidChange = this._onDidChange.event;

  get element() {
    return this._element;
  }

  private _minimumWidth: number = 200;
  private _minimumHeight: number = 200;
  private _maximumWidth: number = Number.MAX_SAFE_INTEGER;
  private _maximumHeight: number = Number.MAX_SAFE_INTEGER;

  get minimumWidth() {
    return this._minimumWidth;
  }
  get minimumHeight() {
    return this._minimumHeight;
  }
  get maximumHeight() {
    return this._maximumHeight;
  }
  get maximumWidth() {
    return this._maximumHeight;
  }

  constructor(
    public readonly id: string,
    private readonly componentName: string,
    private readonly component: React.FunctionComponent<ISplitviewPanelProps>,
    private readonly parent: ReactLayout
  ) {
    super();
    this.api = new PanelApi();
    if (!this.component) {
      throw new Error("React.FunctionalComponent cannot be undefined");
    }

    this._element = document.createElement("div");
    this._element.tabIndex = -1;
    this._element.style.outline = "none";

    const { onDidFocus, onDidBlur } = trackFocus(this._element);

    this.addDisposables(
      onDidFocus(() => {
        this.api._onDidChangeFocus.fire({ isFocused: true });
      }),
      onDidBlur(() => {
        this.api._onDidChangeFocus.fire({ isFocused: false });
      })
    );
  }

  layout(width: number, height: number) {
    this.api._onDidPanelDimensionChange.fire({ width, height });
  }

  init(parameters: InitParameters): void {
    this.params = parameters;
    this.part = new ReactPart(
      this.element,
      this.api,
      this.parent.addPortal,
      this.component,
      parameters.params
    );
  }

  update(params: PanelUpdateEvent) {
    this.params = { ...this.params.params, ...params };
    this.part.update(params);
  }

  toJSON(): object {
    return {
      id: this.id,
      component: this.componentName,
      props: this.params.params,
      state: this.api.getState(),
    };
  }

  dispose() {
    super.dispose();
    this.api.dispose();
  }
}
