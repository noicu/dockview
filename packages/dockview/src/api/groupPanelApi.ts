import { Emitter } from '../events';
import { GridviewPanelApiImpl, GridviewPanelApi } from './gridviewPanelApi';
import { IGroupPanel } from '../groupview/groupPanel';
import { GroupviewPanel } from '../groupview/groupviewPanel';

export interface TitleEvent {
    readonly title: string;
}

export interface SuppressClosableEvent {
    readonly suppressClosable: boolean;
}

/*
 * omit visibility modifiers since the visibility of a single group doesn't make sense
 * because it belongs to a groupview
 */
export interface DockviewPanelApi
    extends Omit<GridviewPanelApi, 'setVisible' | 'visible'> {
    readonly group: GroupviewPanel | undefined;
    readonly isGroupActive: boolean;
    readonly title: string;
    readonly suppressClosable: boolean;
    close(): void;
    setTitle(title: string): void;
}

export class DockviewPanelApiImpl
    extends GridviewPanelApiImpl
    implements DockviewPanelApi
{
    private _group: GroupviewPanel | undefined;

    readonly _onDidTitleChange = new Emitter<TitleEvent>();
    readonly onDidTitleChange = this._onDidTitleChange.event;

    readonly _titleChanged = new Emitter<TitleEvent>();
    readonly titleChanged = this._titleChanged.event;

    readonly _suppressClosableChanged = new Emitter<SuppressClosableEvent>();
    readonly suppressClosableChanged = this._suppressClosableChanged.event;

    get title() {
        return this.panel.title;
    }

    get suppressClosable() {
        return !!this.panel.suppressClosable;
    }

    get isGroupActive() {
        return !!this.group?.isActive;
    }

    set group(value: GroupviewPanel | undefined) {
        this._group = value;
    }

    get group(): GroupviewPanel | undefined {
        return this._group;
    }

    constructor(private panel: IGroupPanel, group: GroupviewPanel | undefined) {
        super(panel.id);
        this._group = group;
    }

    public setTitle(title: string) {
        this._onDidTitleChange.fire({ title });
    }

    public close(): void {
        if (!this.group) {
            throw new Error(`panel ${this.id} has no group`);
        }
        return this.group.model.closePanel(this.panel);
    }

    public dispose() {
        super.dispose();
    }
}
