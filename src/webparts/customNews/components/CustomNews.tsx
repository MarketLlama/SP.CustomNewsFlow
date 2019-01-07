import * as React from 'react';
import styles from './CustomNews.module.scss';
import { ICustomNewsProps } from './ICustomNewsProps';
import { ICustomNewsState } from './ICustomNewsState';
import { escape } from '@microsoft/sp-lodash-subset';
import {sp , Web}  from '@pnp/pnpjs';
import { CreateNewsButton } from './CreateNewsButton';
import { Item } from '@pnp/sp';
import Moment from 'react-moment';
import { SecurityTrimmedControl, PermissionLevel} from "@pnp/spfx-controls-react/lib/SecurityTrimmedControl";
import { SPPermission } from '@microsoft/sp-page-context';

 export interface newsItem {
  Title : string;
  NewsDate : string;
  PageId : number;
  PageURL : string;
  NewsTeaser : string;
  ImgageURL : string;
  HighlightNews : boolean;
  ShowImage : boolean;
}

export default class CustomNews extends React.Component<ICustomNewsProps, ICustomNewsState> {
  constructor(props) {
    super(props);
    this.state = {
        news : []
    };
  }

  private _getAllNews = async () : Promise<newsItem[]> =>{
    return new Promise<newsItem[]>((resolve, reject) =>{ 
      let newsItems : newsItem[] = [];
      const web = new Web(this.props.context.pageContext.site.absoluteUrl + '/articles');

      web.lists.getByTitle('News').items
        .select("Title", "NewsDate", "NewsTeaser", "NewsImage", "TopNews", "HighlightNews", "ShowImage", "Page/ID").orderBy('NewsDate', true)
        .expand("Page").top(20).get().then(items =>{

        let promises = [];
        items.forEach(item => {
          
          let htmlValues = new Item(web.lists.getByTitle('Pages').items.getById(item.Page.ID), "FieldValuesAsHtml");
          let textValue = new  Item(web.lists.getByTitle('Pages').items.getById(item.Page.ID), "FieldValuesAsText");

          let imagePromise =  htmlValues.select("PublishingRollupImage").get();
          let fileRefPromise =  textValue.select("FileRef").get();

          let promise = new Promise((_resolve, _reject) =>{
            Promise.all([imagePromise,fileRefPromise]).then((promiseValues) =>{
                _resolve({
                  image : promiseValues[0].PublishingRollupImage,
                  file : promiseValues[1].FileRef,
                  item : item
                });
            });
          });
          promises.push(promise);
        });
        //TODO: Fix spaghetti code. 
        Promise.all(promises).then(_items =>{
          _items.forEach(item =>{
            //Get src of publishing image 
            //Mark sure RenditionID is within query string or performace will be shite.
            const image = item.image;
            let imageSrc : string = "";
            if(item.item.NewsImage == null){
              if (image !== null && image.length > 1) {
                  const src = /src\s*=\s*"(.+?)"/ig.exec(image);
                  // this wil be the value of the PublishingPageImage field
                if(src[1].indexOf('?') !== -1){
                  imageSrc = src[1].replace("?RenditionID=10", "?RenditionID=6");
                } else {
                  imageSrc = src[1] + "?RenditionID=6";
                }
              } else {
                imageSrc = '';
              } 
            } else {
              imageSrc = item.item.NewsImage;
            }

            newsItems.push({
              Title : item.item.Title,
              NewsDate : item.item.NewsDate,
              PageId : item.item.Page.ID,
              PageURL : item.file,
              NewsTeaser : item.item.NewsTeaser,
              ImgageURL : imageSrc,
              HighlightNews : item.item.HighlightNews,
              ShowImage : item.item.ShowImage
            });
          });
          resolve(newsItems);
        });
        
      }, _error =>{
        reject(newsItems);
      });
    });
  }

  public render(): React.ReactElement<ICustomNewsProps> {
    return (
      <div className={ styles.customNews }>
        <SecurityTrimmedControl context={this.props.context}
                          level={PermissionLevel.currentWeb}
                          permissions={[SPPermission.approveItems]}>
          <CreateNewsButton context={this.props.context} parent={this}/>
        </SecurityTrimmedControl>
        <br/>
        <div className={styles.masonry}>
          {this.state.news}
        </div>
      </div>
    );
  }

  public createNewsFlow = async () => {
    let newsItems : newsItem[] = await this._getAllNews();
    let news = [];
    for (let i = 0; i < newsItems.length ; i++) {
      news.push(this._onRenderNewsCell(newsItems[i]));
    }
    this.setState({
      news : news
    });  
  }

  public componentDidMount() {
    this.createNewsFlow();
  }

  private _onRenderNewsCell = (item : newsItem) : JSX.Element =>{
    return (
      <div className={styles.brick + ' animated fadeIn'}>
        {item.HighlightNews? <span className={styles.feature}>FEATURED</span> : null}
        {item.ShowImage ? <div style={{backgroundImage: 'url(' + item.ImgageURL + ')'}} 
          className={styles.img} onClick={() => window.location.href = item.PageURL + '?isNews=1'}>
        </div> : null}
        <div className={(item.HighlightNews? styles["alt-txt"] : styles.txt)} >
          <a href={item.PageURL + '?isNews=1'}><h2>{item.Title}</h2></a>
          <div className={styles["newsLatest-date"]}>
              <b><Moment format="DD/MM/YYYY">{item.NewsDate}</Moment></b>
          </div>
          <div className={styles["newsLatest-summary"]} >
              {item.NewsTeaser}
          </div>
        </div>
      </div>
    );
  }
}
