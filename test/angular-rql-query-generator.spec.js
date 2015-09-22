'use strict';

describe('rqlQueryGenerator', function() {
  // load the graviphoton-module
  beforeEach(module('angular-rql-query-generator'));

  var rqlQuery;
  // use inject to get the rqlQuery-Factory
  beforeEach(inject(function(_rqlQuery_) {
    rqlQuery = _rqlQuery_;
  }));

  it('should provide a createQuery-function', function() {
    expect(rqlQuery).toBeDefined();
    expect(rqlQuery.createQuery).toBeDefined();
    expect(typeof rqlQuery.createQuery).toEqual('function');
  });

  it('should return an empty string for an empty query', function() {
    var q = rqlQuery.createQuery();
    expect(q.getQueryString()).toEqual('');
  });

  it('should properly create a simple sort-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.sort('-key').getQueryString()).toEqual('sort(-key)');
  });

  it('should properly create a sort-query for sub-sorting', function() {
    var q = rqlQuery.createQuery();
    expect(q.sort('-key', '+id', '-xyz', '-abc').getQueryString()).toEqual('sort(-key,+id,-xyz,-abc)');
  });

  it('should properly create a simple select-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.select('name').getQueryString()).toEqual('select(name)');
  });

  it('should properly create a select-query for multiple selects', function() {
    var q = rqlQuery.createQuery();
    expect(q.select('key', 'id', 'name').getQueryString()).toEqual('select(key,id,name)');
  });

  it('should properly create a like-query without wildcard', function() {
    var q = rqlQuery.createQuery();
    expect(q.like('id', '1234', false).getQueryString()).toEqual('like(id,1234)');
  });

  it('should properly create a like-query with wildcard', function() {
    var q = rqlQuery.createQuery();
    expect(q.like('id', '1234', true).getQueryString()).toEqual('like(id,*1234*)');
  });

  it('should properly create a limit-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.limit(5, 4).getQueryString()).toEqual('limit(5,4)');
  });

  it('should properly create an eq-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.eq('id', 4).getQueryString()).toEqual('eq(id,4)');
  });

  it('should properly create an in-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.in('id', [1, 2]).getQueryString()).toEqual('in(id,(1,2))');
  });

  it('should properly create an and-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.andStart().eq('id', 4).eq('key', 5).andEnd().getQueryString()).toEqual('and(eq(id,4),eq(key,5))');
  });

  it('should properly encode elements in an eq-query', function() {
    var q = rqlQuery.createQuery();
    expect(q.eq('app.$ref', 'http://graviton-develop.nova.scapp.io/core/app/admin').getQueryString())
      .toEqual('eq(app.%24ref,http%3A%2F%2Fgraviton%2Ddevelop%2Enova%2Escapp%2Eio%2Fcore%2Fapp%2Fadmin)');
  });

  it('should properly create two nested and-queries', function() {
    var q = rqlQuery.createQuery();
    expect(q.andStart().andStart().eq('id', 4).eq('key', 5).andEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().andEnd().getQueryString())
      .toEqual('and(and(eq(id,4),eq(key,5)),and(eq(id2,2),eq(key2,3)))');
  });

  it('should properly create a nestet logic operator query', function() {
    var q = rqlQuery.createQuery();
    expect(q.andStart().orStart().eq('id', 4).eq('key', 5).orEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().orStart().eq('id2', 2).eq('key2', 3).orEnd().andEnd().getQueryString())
      .toEqual('and(or(eq(id,4),eq(key,5)),and(eq(id2,2),eq(key2,3)),or(eq(id2,2),eq(key2,3)))');
  });

  it('should properly create this really big query', function() {
    var q = rqlQuery.createQuery();
    expect(q.sort('-id', '+val-ue').select('na%me', '&te,st').like('name', 1, true).limit(5).andStart().orStart().eq('i&d', 4).eq('ke,y', 5).orEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().orStart().eq('id2', 2).eq('key2', 3).orEnd().andEnd().getQueryString())
      .toEqual('sort(-id,+val%2Due)&select(na%25me,%26te%2Cst)&like(name,*1*)&limit(5)&and(or(eq(i%26d,4),eq(ke%2Cy,5)),and(eq(id2,2),eq(key2,3)),or(eq(id2,2),eq(key2,3)))');
  });

});
