import * as React from 'react';
import styles from './CustomNews.module.scss';
import { ICustomNewsProps } from './ICustomNewsProps';
import { ICustomNewsState } from './ICustomNewsState';
import { escape } from '@microsoft/sp-lodash-subset';
import {sp , Web}  from '@pnp/pnpjs';
import { CreateNewsButton } from './CreateNewsButton';

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
        .select("Title", "NewsDate", "NewsTeaser", "Page/Title", "Page/ID").expand("Page").get().then(items =>{
        items.forEach(item => {
          newsItems.push(item);
        });
        resolve(newsItems);
      }, error =>{
        reject(newsItems);
      });
    });
  }

  public render(): React.ReactElement<ICustomNewsProps> {
    return (
      <div className={ styles.customNews }>
        <div className={ styles.container }>
          <CreateNewsButton context={this.props.context} />
          {this._createNewsFlow()}
        </div>
      </div>
    );
  }

  private _createNewsFlow = async () =>{
    let newsItems : newsItem[] = await this._getAllNews();
    let news = [];
        // Outer loop to create parent
        for (let i = 0; i < 3; i++) {
          let children = [];
          //Inner loop to create children
          for (let j = 0; j < 5; j++) {
            children.push(this._onRenderNewsCell(newsItems[i]));
          }
          news.push(<div>{children}</div>);
        }
    return news;
  }

  private _onRenderNewsCell = (item : newsItem) : JSX.Element =>{
    return (
      <div className="brick">
        {item.ImgageURL ? <div className="img" onClick={() => window.location.href = item.PageURL}/> : null}
        <div className={(item.ImgageURL? 'txt' : 'alt-txt')} ng-class="slides[$index].image? 'txt' : 'alt-txt'">
          <a href={item.PageURL} title={item.Title} className="headline wt-linkText"></a>
          <div className="newsLatest-date">
              <b>{item.NewsDate}</b>
          </div>
          <div className="newsLatest-summary" >
              {item.NewsTeaser}
          </div>
        </div>
    </div>
    )
  }
}
