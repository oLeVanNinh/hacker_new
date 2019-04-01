import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner} from '@fortawesome/free-solid-svg-icons'


const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const DEFAULT_HPP = 20;
const PARAM_HPP = 'hitsPerPage=';
library.add(faSpinner)

const Loading = () =>
  <FontAwesomeIcon icon={faSpinner} rotation={270} />

  function isSearched(searchTerm) {
    return function(item) {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }

class Button extends Component {
  render() {
    const { onClick, className = '', children } = this.props;
    return(
      <button onClick={onClick} className={className} type="button">{children}</button>
    )
  }
}

class Search extends Component {
  render() {
    const { value, onChange, onSubmit, children } = this.props;
    return (
      <form onSubmit={onSubmit}>
        {children} <input type="text" value={value} onChange={onChange} />
        <button type="submit">{children}</button>
      </form>
    );
  }
}

class Table extends Component {
  render() {
    const { list, pattern, onDismiss } = this.props;
    return (
      <div className="table">
        {list.filter(isSearched(pattern)).map(item =>
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%'}}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{ width: '30%' }}>{item.author}</span>
              <span style={{ width: '10%' }}>{item.num_comments}</span>
              <span style={{ width: '10%' }}>{item.points}</span>
              <span style={{ width: '10%' }}>
                <Button onClick={() => onDismiss(item.objectID)} className="button-inline">Dimiss</Button>
              </span>
            </div>
          )}
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm]
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    this.setState({results: {...results, [searchKey]: {hits: updatedHits, page}}, isLoading: false})
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm)
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const updatedHits = hits.filter((item) => {
      return item.objectID !== id;
    })
    this.setState({results: {...results, [searchKey]: {hits: updatedHits, page}}})
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }


  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    if (error) {
      return <p>Something went wrong.</p>;
    }

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search </Search>
        </div>
        <Table list={list} pattern={searchTerm} onDismiss={this.onDismiss} />
        <div className="interactions">
          {isLoading ? <Loading /> : <Button onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}>More</Button>}
        </div>
      </div>
    );
  }
}

export default App;
