import * as React from 'react';
import styles from './CustomNews.module.scss';
import { ICustomNewsProps } from './ICustomNewsProps';
import { ICustomNewsState } from './ICustomNewsState';
import { escape } from '@microsoft/sp-lodash-subset';
import {sp , Web}  from '@pnp/pnpjs';
import { CreateNewsButton } from './CreateNewsButton';
import { Item } from '@pnp/sp';
import Moment from 'react-moment';

 export interface newsItem {
  Title : string;
  NewsDate : string;
  PageId : number;
  PageURL : string;
  NewsTeaser : string;
  ImgageURL : string;
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
        .select("Title", "NewsDate", "NewsTeaser", "Page/ID").expand("Page").top(10).get().then(items =>{
        let promises = [];
        items.forEach(item => {
          
          let htmlValues = new Item(web.lists.getByTitle('Pages').items.getById(item.Page.ID), "FieldValuesAsHtml");
          let textValue = new  Item(web.lists.getByTitle('Pages').items.getById(item.Page.ID), "FieldValuesAsText");

          let imagePromise =  htmlValues.select("PublishingRollupImage").get();
          let fileRefPromise =  textValue.select("FileRef").get();

          let promise = new Promise((resolve, reject) =>{
            Promise.all([imagePromise,fileRefPromise]).then((promiseValues) =>{
                resolve({
                  image : promiseValues[0].PublishingRollupImage,
                  file : promiseValues[1].FileRef,
                  item : item
                });
            })
          })
          promises.push(promise);
        });
        //TODO: Fix spaghetti code. 
        Promise.all(promises).then(items =>{
          items.forEach(item =>{
            //Get src of publishing image 
            //Mark sure RenditionID is within query string or performace will be shite.
            const image = item.image;
            let imageSrc : string = "";
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

            newsItems.push({
              Title : item.item.Title,
              NewsDate : item.item.NewsDate,
              PageId : item.item.Page.ID,
              PageURL : item.file,
              NewsTeaser : item.item.NewsTeaser,
              ImgageURL : imageSrc
            })
          })
          resolve(newsItems);
        })
        
      }, error =>{
        reject(newsItems);
      });
    });
  }

  public render(): React.ReactElement<ICustomNewsProps> {
    return (
      <div className={ styles.customNews }>
        <CreateNewsButton context={this.props.context}/>
        <br/>
        <div className={styles.masonry}>
          {this.state.news}
        </div>
      </div>
    );
  }

  private _createNewsFlow = async () => {
    let newsItems : newsItem[] = await this._getAllNews();
    let news = [];
    for (let i = 0; i < newsItems.length ; i++) {
      news.push(this._onRenderNewsCell(newsItems[i]));
    }
    this.setState({
      news : news
    });  
  }

  componentDidMount() {
    this._createNewsFlow();
  }

  private _onRenderNewsCell = (item : newsItem) : JSX.Element =>{
    return (
      <div className={styles.brick}>
        {item.ImgageURL ? <div style={{backgroundImage: 'url(' + item.ImgageURL + ')'}} 
          className={styles.img} onClick={() => window.location.href = item.PageURL}>
        </div> : null}
        <div className={(item.ImgageURL? styles.txt : styles["alt-txt"])} >
          <a href={item.PageURL} title={item.Title} className={styles.headline}>{item.Title}</a>
          <div className={styles["newsLatest-date"]}>
              <b><Moment format="DD/MM/YYYY">{item.NewsDate}</Moment></b>
          </div>
          <div className={styles["newsLatest-summary"]} >
              {item.NewsTeaser}
          </div>
        </div>
      </div>
    )
  }
}
