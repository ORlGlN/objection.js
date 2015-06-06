var _ = require('lodash');
var expect = require('expect.js');
var MoronValidationError = require('../../lib/MoronValidationError');

module.exports = function (session) {
  var Model1 = session.models.Model1;
  var Model2 = session.models.Model2;

  describe('MoronModel unrelate queries', function () {

    describe('.$relatedQuery().unrelate()', function () {

      describe('has one relation', function () {

        beforeEach(function () {
          return session.populate([{
            id: 1,
            model1Prop1: 'hello 1',
            model1Relation1: {
              id: 2,
              model1Prop1: 'hello 2'
            }
          }]);
        });

        it('should unrelate', function () {
          return Model1
            .query()
            .where('id', 1)
            .first()
            .then(function (model) {
              return model
                .$relatedQuery('model1Relation1')
                .unrelate(2);
            })
            .then(function () {
              return session.knex(Model1.tableName).orderBy('id');
            })
            .then(function (rows) {
              expect(rows[0].model1Id).to.equal(null);
            });
        });

      });

      describe('has many relation', function () {

        beforeEach(function () {
          return session.populate([{
            id: 1,
            model1Prop1: 'hello 1',
            model1Relation2: [{
              idCol: 1,
              model2Prop1: 'text 1',
              model2Prop2: 6
            }]
          }, {
            id: 2,
            model1Prop1: 'hello 2',
            model1Relation2: [{
              idCol: 2,
              model2Prop1: 'text 4',
              model2Prop2: 3
            }]
          }]);
        });

        it('should unrelate', function () {
          return Model1
            .query()
            .where('id', 1)
            .first()
            .then(function (model) {
              return model
                .$relatedQuery('model1Relation2')
                .unrelate(1);
            })
            .then(function () {
              return session.knex(Model2.tableName).orderBy('id_col');
            })
            .then(function (rows) {
              expect(rows[0].model_1_id).to.equal(null);
              expect(rows[1].model_1_id).to.equal(2);
            });
        });

      });

      describe('many to many relation', function () {

        beforeEach(function () {
          return session.populate([{
            id: 1,
            model1Prop1: 'hello 1',
            model1Relation2: [{
              idCol: 1,
              model2Prop1: 'text 1',
              model2Relation1: [{
                id: 3,
                model1Prop1: 'blaa 1',
                model1Prop2: 6
              }]
            }]
          }, {
            id: 2,
            model1Prop1: 'hello 2',
            model1Relation2: [{
              idCol: 2,
              model2Prop1: 'text 2',
              model2Relation1: [{
                id: 4,
                model1Prop1: 'blaa 2',
                model1Prop2: 3
              }]
            }]
          }]);
        });

        it('should unrelate', function () {
          return Model2
            .query()
            .where('id_col', 1)
            .first()
            .then(function (model) {
              return model
                .$relatedQuery('model2Relation1')
                .unrelate(3);
            })
            .then(function () {
              return session.knex('Model1Model2').orderBy('id');
            })
            .then(function (rows) {
              expect(rows).to.have.length(1);
              expect(_.where(rows, {model2Id: 2, model1Id: 4})).to.have.length(1);
            });
        });

      });

    });

  });
};
