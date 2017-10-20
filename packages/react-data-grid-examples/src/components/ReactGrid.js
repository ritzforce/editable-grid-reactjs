import React, { Component, onInit } from 'react'
import ReactPaginate from 'react-paginate';
import RowRenderer from './RowRenderer';
import HeaderRenderer from './HeaderRenderer';
import PropTypes from 'prop-types';

import facker from 'faker';
const ReactDataGrid = require('react-data-grid');
const { Editors, Toolbar, Formatters,
DraggableHeader: { DraggableContainer}
 } = require('react-data-grid-addons');
const { AutoComplete: AutoCompleteEditor, DropDownEditor } = Editors;
require('../assets/css/ReactGrid.css');


faker.locale = 'en_US';

//default config
const gridConfig = {
  "pagination": {
    "pageSize": 10,               // Number of records to show on a page
    "allowPaging": true,          // If set to true, the component should display pager controls otherwise displays all records
    "pageControlLocation": "top", // "left", "right", "top", "bottom"
    "pageCssClasses": ["pagination", "pagination-v2"], // CSS classes to be applied to pagination controls
    "allowCustomPaging": true,  //Allows client code to load the records per page. Client will set number of pages.
    "pageChangeCallback": "callbackFunction" //pass page changed event / callback.
  },
  "sorting": {
    "allowStorting": true //If set to true, user should be able to toggle sort by clicking on header
  },
  "readOnly": false,  // If set to true, user should be able to sort the grid by clicking on header, Clicking twice should toggle the sort.
  "values": [], //JSON records to be disapled on the table
  "freeze": {
    "allowFreezing": false,  // true or false values to "Enalble/Disable" freezing globally
    "freezeRows": [], //row indexs to be freezed
    "freezeRowsFromTop": [], // number of rows to be freezed from top. Set 0 to disable freezing
    "freezeColumns": [] // column indexs to be freezed
  },
  "columnArray": [],
  "ui": {
    "cssSrc": "../assets/css/custom-style.css",
    "gridBgColor": "#f7f7f7", // Background color to be applied to the ReactGrid.
    "borderWidth": "1px",
    "borderColor": "#333",
    "fontSize": "14px",
    "cellSpacing":"0px",
    "cellpadding": "0px",
    "autoResize": true
  },
  "runtimeOptions": {
    "draggableColumns":true // Allow Drag and Drop of Columns.
  }
}

require('../assets/css/custom-style.css');



export default class ReactGrid extends Component {

  constructor(props) {
    super(props);
    
    this.getColumns = this.getColumns.bind(this);
    this.handleGridRowsUpdated = this.handleGridRowsUpdated.bind(this);
    this.handleAddRow = this.handleAddRow.bind(this);
    this.getRowAt = this.getRowAt.bind(this);
    this.getSize = this.getSize.bind(this);
    this.handlePaginationChange = this.handlePaginationChange.bind(this);
    this.handleGridSort = this.handleGridSort.bind(this);
    this.unfreezeAllCols = this.unfreezeAllCols.bind(this);
    this.freezeColByIndex = this.freezeColByIndex.bind(this);
    this.unFreezeColByIndex = this.unFreezeColByIndex.bind(this);
    this.initFreeze = this.initFreeze.bind(this);
    this.initColVisibility = this.initColVisibility.bind(this);
    this.initClasses = this.initClasses.bind(this);
    this.onHeaderDrop = this.onHeaderDrop.bind(this);
    this.rowGetter = this.rowGetter.bind(this);

    this.state = {
      columns: [],
      rows: [],
      dynamicRows: [],
      config: {},
      currentPage: 0,
      indexOffset: 0
    }
  }

  componentWillMount() {
    const config = Object.assign(gridConfig, this.props.config);

    this.initFreeze(config);
    this.initColVisibility(config);
    this.initClasses(config);


    this.setState({
      config: config,
      rows: config.values.concat(),
      dynamicRows: config.values.concat()
    });
    window.setTimeout(()=>{

      this.setState({
        columns: this.getColumns()
      });
    })
  }



  // inits Freeze
  initFreeze(config) {

    const {freeze} = config; 

    // handling column freeze
    if(freeze.allowedFreezing){
       freeze.freezeColumns.map((item,i)=>{
        this.freezeColByIndex(item,config);
       })
    }else {
      this.unfreezeAllCols(config);
    }

    // handling column freeze
    if(freeze.allowedFreezing){
        freeze.freezeColumns.map((item,i)=>{
         this.freezeColByIndex(item,config);
        })
     }else {
       this.unfreezeAllCols(config);
     }
  }

  // inits Visible
  initColVisibility(config) {

    const {columnArray} = config; 

    // handling column visibility
     columnArray.map((item,i)=>{
      item.originalWidth = !item.originalWidth ? item.width : item.originalWidth;
      if(!!item.visible){
        item.width = item.originalWidth || 120;
      }else{
        item.width = 0;
      }
     })
  }
  
  // inits Visible
  initClasses(config) {
    const {values, columnArray} = config; 

    // handling column visibility
     values.map((item,i)=>{
      item.columnClass = !!columnArray[i] ? columnArray[i].columnClass : '';
     })
  }

  // set locked true for the column if it's required to be freezed
  freezeColByIndex(index, config){
    config.columnArray[index].locked = true;
  }
  unFreezeColByIndex(index, config){
    config.columnArray[index].locked = false;
  }

  unfreezeAllCols(config) {
    config.columnArray.map((item,i)=>{
     // set locked false to unfreeze column
     item.locked = false;
    })
  }

  getColumns() {
    const {config} = this.state;
    let clonedColumns = config.columnArray.slice();

    clonedColumns.map((item,i)=>{
      item.sortable = !!config.sorting.allowStorting? true : false;
      item.editable = !!config.readOnly ? false : !!item.editable
    })
    return clonedColumns;
  }

  // handleGridRowsUpdated
  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let dynamicRows = this.state.dynamicRows.slice();

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = dynamicRows[i];
      let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
      dynamicRows[i] = updatedRow;
    }

    let rows = this.state.rows.slice();
    let currentPageStartIndex = this.state.currentPage * gridConfig.pagination.pageSize;
    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i+currentPageStartIndex];
      let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
      rows[i+currentPageStartIndex] = updatedRow;
    }


    this.setState({ 
      rows: rows,
      dynamicRows: dynamicRows
    });
  }

  handleAddRow({ newRowIndex }) {
    const newRow = {
      value: newRowIndex,
      userStory: '',
      developer: '',
      epic: ''
    };

    let rows = this.state.rows.slice();
    rows = React.addons.update(rows, {$push: [newRow]});
    this.setState({ rows });
  }

  getRowAt(index) {
    index = index + this.state.indexOffset;

    if(index===9){
      return this.state.dynamicRows[index];
    }

    if (index < this.state.indexOffset || index > this.getSize() + this.state.indexOffset ) {
      return undefined;
    }


    return this.state.dynamicRows[index];
  }

  // getSize
  getSize(allowPaging) {
    const {config} = this.state;
    return allowPaging ? config.pagination.pageSize : this.state.rows.length;
  }

  getPageCount(config) {
    return Math.ceil(this.state.rows.length/this.getSize(config.pagination.allowPaging));
  }

  getPageCssClasses(config) {
    let cn = "";
    config.pagination.pageCssClasses.map((item)=>{
      cn = cn + item + " "
    })
    return cn;
  }

// handleGridSort
  handleGridSort(sortColumn, sortDirection) {
    const comparer = (a, b) => {
        if (sortDirection === 'ASC') {
            return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
        } else if (sortDirection === 'DESC') {
            return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
        }
    };

    const dynamicRows = sortDirection === 'NONE' ? this.state.dynamicRows.concat() : this.state.dynamicRows.sort(comparer);

    this.setState({
        dynamicRows: dynamicRows
    });
  }

  // handlePaginationChange
  handlePaginationChange(selected) {
    let startIndex = selected.selected * this.state.config.pagination.pageSize;
    this.setState({
      dynamicRows: this.state.rows.concat()
    })
    window.setTimeout(()=>{
      let rows = this.state.dynamicRows.splice(0);
      let r = rows.splice(startIndex);
      rows.map((item)=>{
        r.push(item);
        return item;
      })
      this.setState({
        currentPage: selected.selected,
        dynamicRows: r
      })
    })
    /**
     * triggers callback function & returns the 'selected' pagination index. It's a 0 base indexing
     */
    this.state.config.pagination.pageChangeCallback(selected);
  }

  // drag drop
  onHeaderDrop = (source, target) => {
      const stateCopy = Object.assign({}, this.state);
      const columnSourceIndex = this.state.columns.findIndex(
          i => i.key === source
      );
      const columnTargetIndex = this.state.columns.findIndex(
          i => i.key === target
      );
      stateCopy.columns.splice(
          columnTargetIndex,
          0,
          stateCopy.columns.splice(columnSourceIndex, 1)[0]
      );

      const emptyColumns = Object.assign({}, this.state, {
          columns: []
      });
      this.setState(
          emptyColumns
      );

      const reorderedColumns = Object.assign({}, this.state, {
          columns: stateCopy.columns
      });
      this.setState(
          reorderedColumns
      );
  };

  rowGetter = (i) => {
          return this.state.rows[i];
      };

  render() {

    let {config} = this.state;
      return (
        <div className={"datagrid-wrap " 
        + ((config.pagination.pageControlLocation === 'left' || config.pagination.pageControlLocation === 'right')?'inline-view':'')}

          style={{
            backgroundColor : config.ui.gridBgColor,
            fontSize : config.ui.fontSize
          }}
        >
          {
            config.pagination.allowPaging ?
            (
              <div className={"pagination-wrap " + config.pagination.pageControlLocation}>
                <ReactPaginate 
                  pageCount={this.getPageCount(config)}

                  previousLabel={"prev"}
                  nextLabel={"next"}
                  breakLabel={<a href="">...</a>}
                  breakClassName={"break-me"}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={this.handlePaginationChange}
                  containerClassName={"pagination " + this.getPageCssClasses(config)}
                  subContainerClassName={"pages pagination "}
                  activeClassName={"active"} 
                />
              </div>
            )
            : (null)
          }

          <DraggableContainer onHeaderDrop = { this.onHeaderDrop } >
            <ReactDataGrid
              ref={ node => this.grid = node }
              enableCellSelect={!config.readOnly}
              columns={this.state.columns}
              rowGetter={this.getRowAt}
              rowsCount={this.getSize(config.pagination.allowPaging)}
              onGridRowsUpdated={this.handleGridRowsUpdated}
              onGridSort = { this.handleGridSort }
              enableRowSelect={false}
              rowHeight={50}
              minHeight={600}
              rowScrollTimeout={200}
              rowRenderer={RowRenderer}
            />
          </DraggableContainer>
        </div>
      );
  }
}
