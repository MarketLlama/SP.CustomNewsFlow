import * as React from 'react';
import styles from './CustomNews.module.scss';
import pnp, {sp , Web, Site, ItemAddResult, Item, FileAddResult}  from '@pnp/pnpjs';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, ActionButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ListItemPicker } from '@pnp/spfx-controls-react';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerSize, Checkbox, Panel, PanelType, Icon } from 'office-ui-fabric-react';
import { Logger, LogLevel } from '@pnp/logging';
import CustomNews from './CustomNews';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';

const DayPickerStrings: IDatePickerStrings = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year'
};

export interface CreateNewsProps {
    context : WebPartContext;
    getNews : Function;
}

export interface CreateNewsState {
    showModal : boolean;
    hideError? : boolean;
    submitDisabled? : boolean;
    page : any[];
    firstDayOfWeek?: DayOfWeek;
    imageFile : File;
    loading : boolean;
    newsHeadline : string;
    topNews : boolean;
    highlightedNews : boolean;
    showImage : boolean;
    newsTeaser : string;
    newsContent : string;
    newsDate? : Date | null;
    editorState : EditorState;
}

export class CreateNewsButton extends React.Component<CreateNewsProps, CreateNewsState> {

  constructor(props) {
    super(props);
    this.state = {
        imageFile : null,
        newsHeadline : '',
        newsContent : '',
        newsTeaser : '',
        newsDate : new Date(),
        topNews : false,
        showImage : true,
        highlightedNews : false,
        page : [],
        firstDayOfWeek: DayOfWeek.Sunday,
        loading : false,
        showModal : false,
        hideError : true,
        editorState : EditorState.createEmpty()
    };
  }

  public render(): JSX.Element {
    const { firstDayOfWeek, newsDate } = this.state;
    const webUrl : string = this.props.context.pageContext.web.absoluteUrl + '/articles';
    return (
      <div>
        <PrimaryButton
          className={styles.button}
          iconProps={{ iconName: 'Add' }}
          secondaryText="Opens the Sample Modal"
          onClick={this._showModal}
          text="Create News" />
        <Panel
            isOpen={this.state.showModal}
            // tslint:disable-next-line:jsx-no-lambda
            onDismiss={this._closeModal}
            type={PanelType.large}
            headerText="Create a News Article"
            isFooterAtBottom={true}
            onRenderFooterContent={this._onRenderFooterContent}
            className={styles.modalContainer}
          >
          <div id="subtitleId" className={styles.modalBody}>
            <div className="ms-Grid" dir="ltr">
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <p style={{marginTop: '0.4em',marginBottom: '0.4em'}}>Topic page *</p>
                  <ListItemPicker listId='8A4FB100-19E4-43F0-9CC8-10D9FFCF4BCA'
                    columnInternalName='Title'
                    itemLimit={5}
                    onSelectedItem={this._onSelectedItem}
                    context={this.props.context}
                    webUrl = {webUrl}/>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <DatePicker
                    isRequired={true}
                    firstDayOfWeek={firstDayOfWeek}
                    strings={DayPickerStrings}
                    placeholder="Select a date..."
                    ariaLabel="Select a date"
                    label="News Date"
                    onSelectDate={this._onSelectDate}
                    value={newsDate!}
                  />
                </div>
              </div>
              <br/>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                  <TextField label="News Headline" required={true} onChanged={(value) => this.setState({ newsHeadline: value })} rows={2}/>
                </div>
              </div>
              <br/>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                 <TextField label="News Teaser" required={true} onChanged={(value) => this.setState({ newsTeaser: value })} multiline rows={2} />
                </div>
              </div>
              <br/>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                  <p>News content</p>
                  <div className={styles.draftEditor}>
                    <Editor
                        editorState={this.state.editorState}
                        toolbarClassName={styles.toolbar}
                        wrapperClassName={styles.wrapper}
                        editorClassName={styles.editor}
                        onEditorStateChange={(value) => this.setState({ editorState: value })}
                      />
                  </div>
                </div>
              </div>
              <br/>
              <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-sm4 ms-md4 ms-lg3">
                    <Checkbox label="Top News" onChange={(value, isChecked) => this.setState({ topNews: isChecked })} />
                  </div>
                  <div className="ms-Grid-col ms-sm4 ms-md4 ms-lg3">
                    <Checkbox label="Featured News" onChange={(value, isChecked) => this.setState({ highlightedNews: isChecked })} />
                  </div>
                  <div className="ms-Grid-col ms-sm4 ms-md4 ms-lg3">
                    <Checkbox label="Show Image" defaultChecked={true} onChange={(value, isChecked) => this.setState({ showImage: isChecked })} />
                  </div>
              </div>
              <br/>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg3">
                  <input type="File" accept="image/*"
                    id="file" onChange={(e) => this._handleFile(e.target.files)}
                    style={{ display: "none" }} />
                  <PrimaryButton iconProps={{ iconName: 'Upload' }} id="button" value="Upload" onClick={() => { document.getElementById("file").click(); }}>Upload News Image</PrimaryButton>
                </div>
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg9">
                  <span>{this.state.imageFile ? this.state.imageFile.name : ''}</span>
                </div>
              </div>
            </div>
            {this.state.loading ? <Spinner className={styles.loading} size={SpinnerSize.large} label="loading..." ariaLive="assertive" /> : null}
          </div>
        </Panel>
      </div>
    );
  }

  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <PrimaryButton value="submit" iconProps={{ iconName: 'Add' }} disabled={this.state.submitDisabled}
          style={{ marginRight: '8px' }} onClick={this._createNews}>Create</PrimaryButton>
        <DefaultButton onClick={this._closeModal}>Cancel</DefaultButton>
        <span className={styles.errorMessage} hidden={this.state.hideError}> <Icon iconName="StatusErrorFull" />
          Please complete all required fields</span>
      </div>
    );
  }
  private _validation = () : boolean =>{
    const s = this.state;
    if(
      s.page == null || s.page.length == 0||
      s.newsDate == null ||
      s.newsHeadline == '' || s.newsHeadline == null ||
      s.newsTeaser == '' || s.newsTeaser == null
    ) {
      this.setState({
        hideError : false
      });
      return false;
    } else {
      return true;
    }
  }

  private _onSelectDate = (date: Date | null | undefined)=> {
    this.setState({
      newsDate : date
    });
  }

  private _onSelectedItem =(data: { key: string; name: string }[]) =>{
    this.setState({
      page : data
    });
  }

  private _handleFile = (files : FileList) =>{
    this.setState({
      imageFile : files[0]
    });
  }

  private _showModal = (): void => {
    this.setState({ showModal: true });
  }

  private _closeModal = (): void => {
    this.setState({ showModal: false });
  }

  private _showLoading = () =>{
    this.setState({ loading: true });
  }

  private _hideLoading = () =>{
    this.setState({ loading: false });
  }

  private _createNews = async() =>{
    if(!this._validation()){
      return;
    }
    this._showLoading();
    const web = new Web(this.props.context.pageContext.site.absoluteUrl + '/articles');
    let pageIds = [];
    this.state.page.forEach(item =>{
        pageIds.push(item.key);
    });
    try{
      let itemResult: ItemAddResult = await web.lists.getByTitle("News").items.add({
        Title: this.state.newsHeadline,
        NewsDate : this.state.newsDate,
        NewsTeaser : this.state.newsTeaser,
        NewsContent : draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
        TopNews : this.state.topNews,
        ShowImage : this.state.showImage,
        HighlightNews : this.state.highlightedNews,
        PageId :  {
          results : pageIds
        }
      });
      let item: Item = itemResult.item;
      const _web = new Web(this.props.context.pageContext.site.absoluteUrl);
      if(this.state.imageFile){
        if (this.state.imageFile.size <= 10485760) {
          // small upload
          let fileAddResult : FileAddResult =
            await _web.getFolderByServerRelativeUrl("PublishingImages").files.add(this.state.imageFile.name, this.state.imageFile, true);
            console.log(fileAddResult.data.ServerRelativeUrl);
          item.update({
              NewsImage: fileAddResult.data.ServerRelativeUrl,
          });
        } else {
          // large upload
          let fileAddResult : FileAddResult = await _web.getFolderByServerRelativeUrl("PublishingImages").files
          .addChunked(this.state.imageFile.name, this.state.imageFile, data => {
              Logger.log({ data: data, level: LogLevel.Verbose, message: "progress" });
          }, true);
          console.log(fileAddResult.data.ServerRelativeUrl);
          item.update({
            NewsImage: fileAddResult.data.ServerRelativeUrl,
          });
        }
      }
      this._hideLoading();
      this.props.getNews();
      this._closeModal();
    }catch(error) {
      console.log(error);
      this._hideLoading();
    }
  }
}
