import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import InfiniteScroll from 'react-infinite-scroller';
import qwest from 'qwest';
import './normalize.css';
import './index.css';

const api = {
    baseUrl: 'https://api.flickr.com/services/rest/?',
    key: 'ccc40fa2d0e400ea13fae765dea404ba',
    secret: 'ce9639759d72fbaf'
};
var SearchBar = function(props) {
    return (
        <div className='searchBar'>
            <input type='text' id='searchbox' placeholder='what are you looking for?' onChange={props.onChange}/>
        </div>
    );
}

var Thumbnail = function(props){
    return (
        <div className="thumbnail" onClick={(evt) => props.onClick(evt, props.photo)}>
            <a id={props.photo.id} target="_blank">
                <img 
                    src={props.photo.thumbnail} 
                    alt={props.photo.title}
                    width="150" 
                    height="150" 
                    />
            </a>
        </div> 
    );
}

class Grid extends Component {

    render() {
        const loader = 
            <div className="cssload-thecube">
                <div className="cssload-cube cssload-c1"></div>
                <div className="cssload-cube cssload-c2"></div>
                <div className="cssload-cube cssload-c4"></div>
                <div className="cssload-cube cssload-c3"></div>
            </div>;

        var items = [];
        this.props.photos.map((photo, i) => {
            items.push(
                <Thumbnail 
                    photo={photo} 
                    key={i} 
                    onClick={this.props.onThumbnailClick} 
                    />
            );
            return null;
        });
        
        var output;
        if(this.props.keyword && this.props.keyword !== ''){
            if(this.props.hasMorePhotos){
                output = 
                    <div className='grid'>
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={this.props.loadItems}
                            hasMore={this.props.hasMorePhotos}
                            loader={loader}
                            useWindow={true}
                            >

                            <div className="photos">
                                {items}
                            </div>
                        </InfiniteScroll>
                    </div>;
            }
            else{
                var message = '';
                var inf = null;
                if(items.length <= 0){
                    message = 'We can\'t find any photos on Flickr with this keyword';
                }
                else{
                    inf = 
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={this.props.loadItems}
                            hasMore={this.props.hasMorePhotos}
                            loader={loader}
                            useWindow={true}
                            >

                            <div className="photos">
                                {items}
                            </div>
                        </InfiniteScroll>;
                    
                    message = 'You have reached the end of the search result';
                }
                output = <div className='grid'>{inf}<p className='message'>{message}</p></div>;
            }
            
        }
        else{
            output = 
                <div className='grid'>
                    <h2>Search Flickr photos</h2>
                    <p>With this simple javascript app you can search for photos on Flickr and have infinite scroll listing of the resulting search result. Just type some keyword for the photos that you are looking for in the above search bar and the result will appear here. You can then click on each thumbnail and see the large version of the photos (if it's available by Flickr) and alos some details about that photo.</p>
                    <p>Built with React. </p>
                </div>;
        }

        return output;
    }
};

class PhotoWindow extends Component {

    render(){

        var output = null;
        var dom = {};

        if(this.props.id){
            if(this.props.details){
                var info = this.props.details;

                if(info.description){
                    dom.description = <p className='description'>{info.description._content}</p>;
                }
                if(info.views){
                    dom.viewCount = <span className='viewCount'>{info.views} Views</span>;
                }
                if(info.urls.url[0]){
                    dom.url = <a className='link' href={info.urls.url[0]._content}>View on Flickr</a>;
                }
                dom.details = 
                    <div className='details'>
                        {dom.description}
                        {dom.viewCount}
                        {dom.url}
                        <ul className="tags">
                        {
                            info.tags.tag.map((data) => {
                                return <li key={data.id}>{data.raw}</li>
                            })
                        }
                        </ul>
                    </div>;
            }

            var img = new Image();

            img.onload = function(){
                var imagedom = document.getElementById('largeImage');

                if(((img.height*(document.documentElement.clientHeight-60))/img.width)+300 > document.documentElement.clientHeight){
                    imagedom.setAttribute("height", document.documentElement.clientHeight-300);
                }
            }

            img.src = this.props.src;

            output =
                <div className={'photoWindow '+this.props.status}>
                    <div className='window'>
                        <div className='imageWrapper'><img id='largeImage' src={this.props.src} alt={this.props.title} /></div>
                        <div className='info'>
                            <h2>{this.props.title}</h2>
                            {dom.details}
                        </div>
                    </div>
                    <a className='closeButton' target='_blank' onClick={this.props.onCloseButtonClick}>&times;</a>
                </div>;
        }

        return output;
    }
};

class App extends Component {
    constructor(){
        super();
        this.state = {
            keyword: null,
            photos: [],
            hasMorePhotos: true,
            nextUrl: null,
            page: 0,
            photoWindow: {
                id: '',
                src: '',
                status: 'inactive',
                title: ''
            }
        }
        this.onSearchBoxChange = this.onSearchBoxChange.bind(this);
        this.loadGridItems = this.loadGridItems.bind(this);
        this.onThumbnailClick = this.onThumbnailClick.bind(this);
        this.deactivatePhotoWindow = this.deactivatePhotoWindow.bind(this);
    };

    onSearchBoxChange(evt) {
        this.setState({
            keyword: evt.target.value,
            photos: [],
            hasMorePhotos: true,
            nextUrl: null,
            page: 0,
            photoWindow: {
                id: '',
                src: '',
                status: 'inactive',
                title: ''
            }
        });
    }

    loadGridItems(page) {
        var self = this;

        var url = api.baseUrl + 'method=flickr.photos.search';
        if(this.state.nextUrl){
            url = this.state.nextUrl;
        }

        var qwestConfig = {
            api_key: api.key,
            format: 'json',
            nojsoncallback: 1,
            sort: 'relevance',
            per_page: 16,
            text: this.state.keyword,
            page: page
        };
        window.activeKeyword = this.state.keyword;
        x("Outsideasync", [window.activeKeyword]);

        qwest.get(url,qwestConfig,{cache: true})
        .then(function(xhr, resp){
            if(resp) {
                var photos = self.state.photos;

                resp.photos.photo.map((photo) => {
                    if(photo.thumbnail_url == null) {
                        photo.thumbnail = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`;
                        photo.large = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
                    }

                    photos.push(photo);

                    return null;
                });
                if(!self.state.keyword){
                    photos = [];
                }

                if(resp.photos.page < resp.photos.pages){
                    if(url.indexOf('&page=') === -1){
                        url = url+'&page='+page
                    }
                    else{
                        url = url.split('&page=')[0] + '&page='+page
                    }
                    self.setState({
                        photos: photos,
                        nextUrl: url
                    });
                }
                else{
                    self.setState({
                        hasMorePhotos: false
                    });
                }
            }
        });
    }

    onThumbnailClick(evt, photo){
        var self = this;
        evt.preventDefault();

        var url = api.baseUrl + 'method=flickr.photos.getInfo';
        var qwestConfig = {
            api_key: api.key,
            format: 'json',
            nojsoncallback: 1,
            photo_id: photo.id
        };
        qwest.get(url,qwestConfig,{cache: true})
        .then(function(xhr, resp){
            self.setState({
                photoWindow: {
                    id: photo.id,
                    src: photo.large,
                    status: 'active',
                    title: photo.title,
                    details: resp.photo
                }
            });
        });
    }

    deactivatePhotoWindow(evt){
        evt.preventDefault();
        this.setState({
            photoWindow: {
                id: '',
                src: '',
                status: 'inactive',
                title: ''
            }
        });
    }

    render (){
        var photoWindow = null;
        if(this.state.photoWindow.status === 'active'){
            photoWindow = 
                <PhotoWindow 
                    id={this.state.photoWindow.id} 
                    src={this.state.photoWindow.src} 
                    title={this.state.photoWindow.title} 
                    details={this.state.photoWindow.details}
                    status={this.state.photoWindow.status} 
                    onCloseButtonClick={this.deactivatePhotoWindow}
                />;
        }

        var output = 
            <div>
                <SearchBar onChange={this.onSearchBoxChange} />
                <Grid 
                    keyword={this.state.keyword} 
                    loadItems={this.loadGridItems} 
                    photos={this.state.photos}
                    hasMorePhotos={this.state.hasMorePhotos}
                    onThumbnailClick={this.onThumbnailClick}
                    />
                {photoWindow}
            </div>;
        return output;
    }
};

ReactDOM.render(
    <App />
, document.getElementById('root'));


var x = function(text, obj, showtrace=true){
    var initChar = "\uD83E\uDC36 ";
    if(showtrace){
        var stack = (new Error).stack;
        stack = stack.split('\n').map(function (line) { return line.trim(); });
        stack = stack.splice(stack[0] === 'Error' ? 2 : 1);
    }

    if(typeof text === "object" && obj === undefined){
        obj = text;
        showtrace ? console.log(initChar, obj, stack[0], [stack]) : console.log(initChar, obj);
    }
    else{
        showtrace ? console.log(initChar+text+" ["+stack[0]+"]", [stack]) : console.log(initChar+text);
        if(obj) console.log(initChar,obj);
    }
}