angular.module('angular-rql-query-generator', [])
  .factory('rqlQueryGenerator', function ($log) {

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
    Query.prototype.getQueryString = function () {
      return this.queryString.substr(0, this.queryString.length - 1);
    };

    /**
     * Adds sort to the query string
     *
     * @param {...string} property 1 to n properties
     * @returns {Query}
     */
    Query.prototype.sort = function () {
      var sortQuery = 'sort(';
      for (var i = 0; i < arguments.length; i++) {
        var sortChar = arguments[i].substr(0, 1);
        var property = arguments[i].substr(1, arguments[i].length);
        sortQuery += sortChar + encodeProperty(property) + ',';
      }
      this.queryString += sortQuery.substr(0, sortQuery.length - 1) + ')&';

      return this;
    };

    /**
     * Adds select to query string
     *
     * @param {...string} property 1 to n properties
     * @returns {Query}
     */
    Query.prototype.select = function () {
      var selectQuery = 'select(';
      for (var i = 0; i < arguments.length; i++) {
        selectQuery += encodeProperty(arguments[i]) + ',';
      }
      this.queryString += selectQuery.substr(0, selectQuery.length - 1) + ')&';

      return this;
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
      var wildcard = wildcards ? '*' : '';
      this.queryString += 'like(' + encodeProperty(property) + ',' + wildcard + encodeString(value) + wildcard + ')&';

      return this;
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

      var startString = start ? ',' + start : '';
      this.queryString += 'limit(' + count + startString + ')&';

      return this;
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
          this.queryString += operator + '(' + encodeProperty(property) + ',' + encodeString(value) + ')&';
          return this;
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
          this.queryString += operator + '(' + encodeProperty(property) + ',(' + encodeString(values) + '))&';
          return this;
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
          queryLengths.push(this.queryString.length);
          this.queryString += operator + '(';
          return this;
        };

        /**
         * Adds end of {function name} to the query string
         *
         * @returns {Query}
         */
        Query.prototype[operator + 'End'] = function () {
          var currentQueryLength = queryLengths[queryLengths.length - 1];
          // Changes since {operator}Start
          var changes = this.queryString.substr(currentQueryLength, this.queryString.length - currentQueryLength - 1);
          // If {operator} params are empty no changes
          if (changes === operator) {
            changes = '';
          } else {
            changes = changes.replace(/&/g, ',') + ')&';
          }

          this.queryString = this.queryString.substr(0, currentQueryLength) + changes;
          queryLengths.splice(-1, 1);
          return this;
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

    return {
      createQuery: function () {
        return new Query();
      }
    };
  });
