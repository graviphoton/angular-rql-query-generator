/**
 * License: GPL-3.0
 */
angular.module('angular-rql-query-generator', [])
  .factory('RqlQuery', function ($log) {

    var SCALAR_OPERATORS = ['eq', 'ne', 'lt', 'gt', 'le', 'ge'];
    var ARRAY_OPERATORS = ['in', 'out'];
    var LOGIC_OPERATORS = ['and', 'or', 'not'];


    function Query() {
      this.queryString = '';
    }

    /**
     * Returns the query string
     *
     * @returns {string}
     */
    Query.prototype.toString = function () {
      return this.queryString.substr(0, this.queryString.length - 1);
    };

    /**
     * Adds sort to the query string
     *
     * @param {...string} property 1 to n properties
     * @returns {Query}
     */
    Query.prototype.sort = function () {
      var query = getNewQuery(this.queryString);
      var sortQuery = 'sort(';
      for (var i = 0; i < arguments.length; i++) {
        var sortChar = arguments[i].substr(0, 1);
        var property = arguments[i].substr(1, arguments[i].length);
        sortQuery += sortChar + encodeProperty(property) + ',';
      }
      query.queryString += sortQuery.substr(0, sortQuery.length - 1) + ')&';

      return query;
    };

    /**
     * Adds select to query string
     *
     * @param {...string} property 1 to n properties
     * @returns {Query}
     */
    Query.prototype.select = function () {
      var query = getNewQuery(this.queryString);
      var selectQuery = 'select(';
      for (var i = 0; i < arguments.length; i++) {
        selectQuery += encodeProperty(arguments[i]) + ',';
      }
      query.queryString += selectQuery.substr(0, selectQuery.length - 1) + ')&';

      return query;
    };

    /**
     * Adds like to the query string
     *
     * @param {string}  property  Property to search in
     * @param {string}  value     Value to search
     * @param {boolean} wildcards Wildcards before and after search
     * @returns {Query}
     */
    Query.prototype.like = function (property, value, wildcards) {
      var query = getNewQuery(this.queryString);
      var wildcard = wildcards ? '*' : '';
      query.queryString += 'like(' + encodeProperty(property) + ',' + wildcard + encodeString(value) + wildcard + ')&';

      return query;
    };

    /**
     * Adds limit to the query string
     *
     * @param {number} count    Number of Records
     * @param {number} start    Start of count
     * @param {number} maxCount TODO What's this?
     * @returns {Query}
     */
    Query.prototype.limit = function (count, start) {
      if (isNaN(count) || (start && isNaN(start))) {
        $log.warn('Warning: limit(' + count + ',' + start + ') is not allowed - skipping!');
        return this;
      }

      var query = getNewQuery(this.queryString);
      var startString = start ? ',' + start : '';
      query.queryString += 'limit(' + count + startString + ')&';

      return query;
    };

    function updateQueryMethods() {

      SCALAR_OPERATORS.forEach(function (operator) {
        if (typeof Query.prototype[operator] === 'function') {
          return;
        }

        /**
         * Adds {function name} to the query string
         *
         * @param {string} property
         * @param {any}    value
         * @returns {Query}
         */
        Query.prototype[operator] = function (property, value) {
          var query = getNewQuery(this.queryString);
          query.queryString += operator + '(' + encodeProperty(property) + ',' + encodeString(value) + ')&';
          return query;
        };
      });

      ARRAY_OPERATORS.forEach(function (operator) {
        if (typeof Query.prototype[operator] === 'function') {
          return;
        }

        /**
         * Adds {function name} to the query string
         *
         * @param {string} property
         * @param {array}  values
         * @returns {Query}
         */
        Query.prototype[operator] = function (property, values) {
          var query = getNewQuery(this.queryString);
          query.queryString += operator + '(' + encodeProperty(property) + ',(' + encodeString(values) + '))&';
          return query;
        };
      });

      LOGIC_OPERATORS.forEach(function (operator) {
        if (typeof Query.prototype[operator] === 'function') {
          return;
        }

        var queryLengths = [];
        /**
         * Adds start of {function name} to the query string
         *
         * @returns {Query}
         */
        Query.prototype[operator + 'Start'] = function () {
          var query = getNewQuery(this.queryString);
          queryLengths.push(query.queryString.length);
          query.queryString += operator + '(';
          return query;
        };

        /**
         * Adds end of {function name} to the query string
         *
         * @returns {Query}
         */
        Query.prototype[operator + 'End'] = function () {
          var query = getNewQuery(this.queryString);
          var currentQueryLength = queryLengths[queryLengths.length - 1];
          // Changes since {operator}Start
          var changes = query.queryString.substr(currentQueryLength, query.queryString.length - currentQueryLength - 1);
          // If {operator} params are empty no changes
          if (changes === operator) {
            changes = '';
          } else {
            changes = changes.replace(/&/g, ',') + ')&';
          }

          query.queryString = query.queryString.substr(0, currentQueryLength) + changes;
          queryLengths.splice(-1, 1);
          return query;
        };
      });
    }

    updateQueryMethods();

    function encodeString(value) {
      // @TODO Do not escape dates (date search)
      if (typeof value !== 'string') {
        return value;
      }
      return encodeURIComponent(value).replace(/[\-_\+\.~!\\'\*\(\)]/g, function (char) {
        return '%' + char.charCodeAt(0).toString(16).toUpperCase();
      });
    }

    // no . encoding for nested properties
    function encodeProperty(property) {
      return encodeURIComponent(property).replace(/[\-_\+~!\\'\*\(\)]/g, function (char) {
        return '%' + char.charCodeAt(0).toString(16).toUpperCase();
      });
    }

    function getNewQuery(queryString) {
      var query = new Query();
      query.queryString = queryString;
      return query;
    }

    return Query;
  });
