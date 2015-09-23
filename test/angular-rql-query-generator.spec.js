'use strict';

describe('rqlQueryGenerator', function() {
  // load the graviphoton-module
  beforeEach(module('angular-rql-query-generator'));

  var rqlQueryGenerator;
  // use inject to get the rqlQueryGenerator-Factory
  beforeEach(inject(function(_rqlQueryGenerator_) {
    rqlQueryGenerator = _rqlQueryGenerator_;
  }));

  it('should provide a createQuery-function', function() {
    expect(rqlQueryGenerator).toBeDefined();
    expect(rqlQueryGenerator.createQuery).toBeDefined();
    expect(typeof rqlQueryGenerator.createQuery).toEqual('function');
  });

  it('should return an empty string for an empty query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.toString()).toEqual('');
  });

  it('should properly create a simple sort-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.sort('-key').toString()).toEqual('sort(-key)');
  });

  it('should properly create a sort-query for sub-sorting', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.sort('-key', '+id', '-xyz', '-abc').toString()).toEqual('sort(-key,+id,-xyz,-abc)');
  });

  it('should properly create a simple select-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.select('name').toString()).toEqual('select(name)');
  });

  it('should properly create a select-query for multiple selects', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.select('key', 'id', 'name').toString()).toEqual('select(key,id,name)');
  });

  it('should properly create a like-query without wildcard', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.like('id', '1234', false).toString()).toEqual('like(id,1234)');
  });

  it('should properly create a like-query with wildcard', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.like('id', '1234', true).toString()).toEqual('like(id,*1234*)');
  });

  it('should properly create a limit-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.limit(5, 4).toString()).toEqual('limit(5,4)');
  });

  it('should properly create an eq-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.eq('id', 4).toString()).toEqual('eq(id,4)');
  });

  it('should properly create an in-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.in('id', [1, 2]).toString()).toEqual('in(id,(1,2))');
  });

  it('should properly create an and-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.andStart().eq('id', 4).eq('key', 5).andEnd().toString()).toEqual('and(eq(id,4),eq(key,5))');
  });

  it('should properly encode elements in an eq-query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.eq('app.$ref', 'http://graviton-develop.nova.scapp.io/core/app/admin').toString())
      .toEqual('eq(app.%24ref,http%3A%2F%2Fgraviton%2Ddevelop%2Enova%2Escapp%2Eio%2Fcore%2Fapp%2Fadmin)');
  });

  it('should properly create two nested and-queries', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.andStart().andStart().eq('id', 4).eq('key', 5).andEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().andEnd().toString())
      .toEqual('and(and(eq(id,4),eq(key,5)),and(eq(id2,2),eq(key2,3)))');
  });

  it('should properly create a nestet logic operator query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.andStart().orStart().eq('id', 4).eq('key', 5).orEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().orStart().eq('id2', 2).eq('key2', 3).orEnd().andEnd().toString())
      .toEqual('and(or(eq(id,4),eq(key,5)),and(eq(id2,2),eq(key2,3)),or(eq(id2,2),eq(key2,3)))');
  });

  it('should properly create this really big query', function() {
    var q = rqlQueryGenerator.createQuery();
    expect(q.sort('-id', '+val-ue').select('na%me', '&te,st').like('name', 1, true).limit(5).andStart().orStart().eq('i&d', 4).eq('ke,y', 5).orEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().orStart().eq('id2', 2).eq('key2', 3).orEnd().andEnd().toString())
      .toEqual('sort(-id,+val%2Due)&select(na%25me,%26te%2Cst)&like(name,*1*)&limit(5)&and(or(eq(i%26d,4),eq(ke%2Cy,5)),and(eq(id2,2),eq(key2,3)),or(eq(id2,2),eq(key2,3)))');
  });

  it('should properly handle two queries', function() {
    var q1 = rqlQueryGenerator.createQuery();
    var q2 = rqlQueryGenerator.createQuery();
    q1.sort('-id', '+val-ue').select('na%me', '&te,st').like('name', 1, true).limit(5).andStart().orStart().eq('i&d', 4);
    q2.sort('-id', '+value2').select('name2', 'test').like('name', 1, true).limit(5).andStart().orStart().eq('id2', 4).eq('key', 5).orEnd().andStart().eq('id', 2);
    q1.eq('ke,y', 5).orEnd().andStart().eq('id2', 2).eq('key2', 3).andEnd().orStart().eq('id2', 2).eq('key2', 3).orEnd();
    q2.eq('key', 3).andEnd().orStart().eq('id', 2).eq('key', 3).orEnd().andEnd();
    q1.andEnd();

    expect(q1.toString())
      .toEqual('sort(-id,+val%2Due)&select(na%25me,%26te%2Cst)&like(name,*1*)&limit(5)&and(or(eq(i%26d,4),eq(ke%2Cy,5)),and(eq(id2,2),eq(key2,3)),or(eq(id2,2),eq(key2,3)))');
    expect(q2.toString())
      .toEqual('sort(-id,+value2)&select(name2,test)&like(name,*1*)&limit(5)&and(or(eq(id2,4),eq(key,5)),and(eq(id,2),eq(key,3)),or(eq(id,2),eq(key,3)))');
  });

});
