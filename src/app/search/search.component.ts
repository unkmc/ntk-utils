import { Component, OnInit } from '@angular/core';
import { ILink } from '../models/link.interface';
import { DataService } from '../data.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  board: string = '';
  terms: string[] = [];
  links: ILink[] = [];
  searching: boolean = false;
  currentBoardLink: string;
  currentBoardText: string;
  noResults: boolean = false;
  results: string[] = [];
  totalLinks: number;

  constructor(private _data: DataService, private _http: HttpClient ) {}

  ngOnInit() {
    this._data.links.subscribe(( res: Array<ILink> ) => this.links = res );
    this._data.searching.subscribe(( res: boolean ) => this.searching = res );
  }

  onBoardChange( value: string ) {
    this.board = value;

    const currentlySelected = this.links.filter(( link ) => link.key === this.board )[0];

    if ( currentlySelected ) {
      this.currentBoardLink = currentlySelected.link;
      this.currentBoardText = currentlySelected.text
    }
  }

  termsUpdated( value: string ) {
    const rawTerms = value.replace( /\n/g, '' ).split( /,/ );
    this.terms = rawTerms.map(( term ) => term.trim() ).filter(( term ) => term.length > 0 );
  }

  doSearch() {
    const endpoint = `/api/search?baseLink=${this.currentBoardLink}&terms=${ this.terms.join( '|' )}`;
    this._http.get( endpoint ).subscribe(( data: any ) => {
      this.results    = data.uLinks;
      this.totalLinks = data.totalLinks;
      this.noResults  = data.uLinks.length === 0;
    });
  }

  buttonDisabled(): string {
    if ( this.searching ) { return 'disabled'; }
    if ( this.board.length === 0 ) { return 'disabled'; }
    if ( this.terms.length === 0 ) { return 'disabled'; }
    return '';
  }

  resultCount(): string {
    if ( this.noResults ) { return ''; }
    return ` (${this.results.length})`;
  }
}