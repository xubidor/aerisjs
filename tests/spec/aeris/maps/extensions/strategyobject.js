define([
  'aeris/util',
  'aeris/maps/extensions/strategyobject',
  'aeris/promise',
  'testUtils',
  'mocks/require'
], function(_, StrategyObject, Promise, testUtil, MockRequire) {

  var StrategyTypeFactory = function() {
    var Strategy = jasmine.createSpy(_.uniqueId('MockStrategyCtor_'));

    Strategy.prototype.destroy = jasmine.createSpy('MockStrategy#destroy');

    return Strategy;
  };


  function errBack(e) {
    throw e;
  }


  describe('StrategyObject', function() {

    describe('constructor', function() {

      it('should set a strategy', function() {
        var Strategy = StrategyTypeFactory();

        spyOn(StrategyObject.prototype, 'setStrategy');

        new StrategyObject({
          strategy: Strategy
        });

        expect(StrategyObject.prototype.setStrategy).toHaveBeenCalledWith(Strategy);
      });

      it('should load a strategy from a string path', function() {
        spyOn(StrategyObject.prototype, 'loadStrategy').andReturn(new Promise());

        new StrategyObject({
          strategy: 'mock/strategy'
        });

        expect(StrategyObject.prototype.loadStrategy).toHaveBeenCalledWith('mock/strategy');
      });

      it('should not require a strategy argument', function() {
        // Shouldn't throw an error
        new StrategyObject();
      });

      it('should accept null as a strategy', function() {
        new StrategyObject({
          strategy: null
        });
      });

    });


    describe('setStrategy', function() {

      it('should instantiate a strategy', function() {
        var Strategy = StrategyTypeFactory();
        var obj = new StrategyObject();

        obj.setStrategy(Strategy);
        expect(Strategy).toHaveBeenCalledWith(obj);
      });

      it('should remove any existing strategy', function() {
        var OldStrategy = StrategyTypeFactory();
        var NewStrategy = StrategyTypeFactory();
        var obj = new StrategyObject();

        obj.setStrategy(OldStrategy);

        spyOn(obj, 'removeStrategy');
        obj.setStrategy(NewStrategy);

        expect(obj.removeStrategy).toHaveBeenCalled();
      });

      it('should reject invalid constructor', function() {
        var invalids = [
          { foo: 'bar' },
          new Date(),
          undefined
        ];
        var obj = new StrategyObject();

        _(invalids).each(function(baddy) {
          expect(function() {
            obj.setStrategy(baddy);
          }).toThrowType('InvalidArgumentError');
        });

      });

    });


    describe('loadStrategy', function() {
      var Strategy, mockRequire;

      beforeEach(function() {
        Strategy = StrategyTypeFactory();

        mockRequire = new MockRequire();
        mockRequire.useMockRequire();
        mockRequire.useMockDefine();

        define('aeris/maps/strategy/mockStrategyModule', function() {
          return Strategy;
        });

        spyOn(StrategyObject.prototype, 'setStrategy');
      });

      afterEach(function() {
        mockRequire.restore();
      });


      it('should set the strategy to a named ReqJS module', function() {
        var obj = new StrategyObject();

        obj.loadStrategy('mockStrategyModule').
          done(testUtil.setFlag).
          fail(errBack);

        waitsFor(testUtil.checkFlag, 100, 'load to complete');
        runs(function() {
          expect(obj.setStrategy).toHaveBeenCalledWith(Strategy);
          expect(obj.setStrategy).toHaveBeenCalledInTheContextOf(obj);
        });
      });

      it('should complain if the strategy module doesn\'t exist', function() {
        var obj = new StrategyObject();

        obj.loadStrategy('no/modules/here').
          fail(function(e) {
            expect(e.name).toEqual('InvalidArgumentError');
            testUtil.setFlag();
          });

        waitsFor(testUtil.checkFlag, 100, 'load promise to be rejected');
      });

    });


    describe('removeStrategy', function() {

      it('should do nothing if no strategy exists', function() {
        var obj = new StrategyObject();

        // Just don't throw an error
        obj.removeStrategy();
      });

      it('should destroy any existing strategy', function() {
        var obj = new StrategyObject();
        var Strategy = StrategyTypeFactory();

        obj.setStrategy(Strategy);

        obj.removeStrategy();
        expect(Strategy.prototype.destroy).toHaveBeenCalled();
      });

      it('should do nothing the second time you call it, because it has no longer has a reference to the strategy.', function() {
        var obj = new StrategyObject();
        var Strategy = StrategyTypeFactory();

        obj.setStrategy(Strategy);

        obj.removeStrategy();
        obj.removeStrategy();
        expect(Strategy.prototype.destroy.callCount).toEqual(1);
      });

    });

    describe('resetStrategy', function() {
      var strategyObject, StrategyType;

      beforeEach(function() {
        strategyObject = new StrategyObject();
        StrategyType = StrategyTypeFactory();
      });


      describe('if no strategy has been set', function() {

        it('should throw an error', function() {
          expect(function() {
            strategyObject.resetStrategy();
          }).toThrow('Unable to reset strategy: no strategy has yet been defined');
        });

      });

      describe('if a strategy has been set', function() {

        beforeEach(function() {
          strategyObject.setStrategy(StrategyType);
        });


        it('should set the same strategy again', function() {
          spyOn(strategyObject, 'setStrategy');
          strategyObject.resetStrategy();

          expect(strategyObject.setStrategy).toHaveBeenCalledWith(StrategyType);
        });

        describe('if a strategy has then been removed', function() {

          beforeEach(function() {
            strategyObject.removeStrategy();
          });

          it('should set the same strategy again', function() {
            spyOn(strategyObject, 'setStrategy');
            strategyObject.resetStrategy();

            expect(strategyObject.setStrategy).toHaveBeenCalledWith(StrategyType);
          });

        });

      });

    });

  });

});
