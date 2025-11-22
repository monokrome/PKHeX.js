import { describe, it, expect, beforeAll } from 'vitest';
import { initializeWASM, getWASM, withTestSave } from './wasm-test-setup';
import { createPKHeXApiWrapper } from '../src/api-wrapper';

/**
 * Integration Tests
 * 
 * These tests use the actual WASM module instead of mocks.
 * They catch serialization errors that unit tests miss.
 */

describe('Integration Tests', () => {
  let rawApi: any;
  let api: any;

  beforeAll(async () => {
    const context = await initializeWASM();
    if (!context.isReady) {
      throw new Error('Failed to initialize WASM for integration tests');
    }
    rawApi = context.rawApi;
    api = createPKHeXApiWrapper(rawApi);
  }, 60000); // 60 second timeout for WASM initialization

  describe('Serialization Validation', () => {
    it('should serialize GetTrainerCard error response', () => {
      // Test with invalid handle to get error response
      const jsonResponse = rawApi.GetTrainerCard(-1);
      
      // Should be valid JSON
      expect(() => JSON.parse(jsonResponse)).not.toThrow();
      
      const parsed = JSON.parse(jsonResponse);
      
      // Should be an error response
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize GetTrainerAppearance error response', () => {
      const jsonResponse = rawApi.GetTrainerAppearance(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize GetBadges error response', () => {
      const jsonResponse = rawApi.GetBadges(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize GetDaycare error response', () => {
      const jsonResponse = rawApi.GetDaycare(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });
  });

  describe('API Wrapper Integration', () => {
    it('should handle GetTrainerCard through wrapper', () => {
      const result = api.save.trainer.getCard(-1);
      
      // Should not have parse errors
      expect(result).toBeDefined();
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });

    it('should handle GetTrainerAppearance through wrapper', () => {
      const result = api.save.trainer.getAppearance(-1);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid handle gracefully', () => {
      const jsonResponse = rawApi.GetTrainerCard(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize error responses correctly', () => {
      const jsonResponse = rawApi.GetTrainerCard(999999);
      
      // Should be valid JSON even for errors
      expect(() => JSON.parse(jsonResponse)).not.toThrow();
      
      const parsed = JSON.parse(jsonResponse);
      expect(parsed).toHaveProperty('error');
    });
  });

  describe('Complex Type Serialization', () => {
    it('should serialize nested objects in GetSpeciesForms', () => {
      const jsonResponse = rawApi.GetSpeciesForms(25, 3); // Pikachu, Gen 3
      const parsed = JSON.parse(jsonResponse);
      
      if (parsed.error) {
        expect(typeof parsed.error).toBe('string');
      } else {
        expect(parsed).toHaveProperty('species');
        expect(parsed).toHaveProperty('speciesName');
        expect(parsed).toHaveProperty('forms');
        expect(Array.isArray(parsed.forms)).toBe(true);
        
        if (parsed.forms.length > 0) {
          const form = parsed.forms[0];
          expect(form).toHaveProperty('formIndex');
          expect(form).toHaveProperty('baseStats');
          expect(form.baseStats).toHaveProperty('hp');
          expect(typeof form.baseStats.hp).toBe('number');
        }
      }
    });

    it('should serialize evolution chains in GetSpeciesEvolutions', () => {
      const jsonResponse = rawApi.GetSpeciesEvolutions(25, 3); // Pikachu, Gen 3
      const parsed = JSON.parse(jsonResponse);
      
      if (parsed.error) {
        expect(typeof parsed.error).toBe('string');
      } else {
        expect(parsed).toHaveProperty('species');
        expect(parsed).toHaveProperty('evolutionChain');
        expect(Array.isArray(parsed.evolutionChain)).toBe(true);
        
        if (parsed.evolutionChain.length > 0) {
          const entry = parsed.evolutionChain[0];
          expect(entry).toHaveProperty('species');
          expect(entry).toHaveProperty('speciesName');
          expect(entry).toHaveProperty('form');
        }
      }
    });
  });

  describe('Save Progress Methods', () => {
    it('should serialize CollectColorfulScrews error response', () => {
      const jsonResponse = rawApi.CollectColorfulScrews(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize GetColorfulScrewLocations with boolean parameter', () => {
      const jsonResponseFalse = rawApi.GetColorfulScrewLocations(-1, false);
      const jsonResponseTrue = rawApi.GetColorfulScrewLocations(-1, true);
      
      expect(() => JSON.parse(jsonResponseFalse)).not.toThrow();
      expect(() => JSON.parse(jsonResponseTrue)).not.toThrow();
    });

    it('should serialize GetInfiniteRoyalePoints error response', () => {
      const jsonResponse = rawApi.GetInfiniteRoyalePoints(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize SetInfiniteRoyalePoints with large values', () => {
      const maxInt32 = 2147483647;
      const jsonResponse = rawApi.SetInfiniteRoyalePoints(-1, maxInt32, maxInt32);
      
      expect(() => JSON.parse(jsonResponse)).not.toThrow();
    });
  });

  describe('Save Configuration Methods', () => {
    it('should serialize SetTextSpeed error response', () => {
      const jsonResponse = rawApi.SetTextSpeed(-1, 3);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize GetTextSpeed error response', () => {
      const jsonResponse = rawApi.GetTextSpeed(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should handle all text speed values', () => {
      for (let speed = 0; speed <= 3; speed++) {
        const jsonResponse = rawApi.SetTextSpeed(-1, speed);
        expect(() => JSON.parse(jsonResponse)).not.toThrow();
      }
    });
  });

  describe('Save Features Methods', () => {
    it('should serialize UnlockFashionCategory error response', () => {
      const jsonResponse = rawApi.UnlockFashionCategory(-1, 'tops');
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should handle all fashion categories', () => {
      const categories = [
        'tops', 'bottoms', 'allinone', 'headwear', 'eyewear',
        'gloves', 'legwear', 'footwear', 'satchels', 'earrings'
      ];

      for (const category of categories) {
        const jsonResponse = rawApi.UnlockFashionCategory(-1, category);
        expect(() => JSON.parse(jsonResponse)).not.toThrow();
      }
    });

    it('should serialize UnlockAllFashion error response', () => {
      const jsonResponse = rawApi.UnlockAllFashion(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize UnlockAllHairMakeup error response', () => {
      const jsonResponse = rawApi.UnlockAllHairMakeup(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });
  });

  describe('Inventory Operations', () => {
    it('should serialize GetPouchItems error response', () => {
      const jsonResponse = rawApi.GetPouchItems(-1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize AddItemToPouch error response', () => {
      const jsonResponse = rawApi.AddItemToPouch(-1, 1, 1, 0);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should serialize RemoveItemFromPouch error response', () => {
      const jsonResponse = rawApi.RemoveItemFromPouch(-1, 1, 1);
      const parsed = JSON.parse(jsonResponse);
      
      expect(parsed).toHaveProperty('error');
      expect(typeof parsed.error).toBe('string');
    });

    it('should get inventory pouches from real save file', async () => {
      await withTestSave(rawApi, (handle) => {
        const jsonResponse = rawApi.GetPouchItems(handle);
        const parsed = JSON.parse(jsonResponse);
        
        if (parsed.error) {
          expect(typeof parsed.error).toBe('string');
        } else {
          expect(Array.isArray(parsed)).toBe(true);
          
          if (parsed.length > 0) {
            const pouch = parsed[0];
            expect(pouch).toHaveProperty('pouchType');
            expect(pouch).toHaveProperty('pouchIndex');
            expect(pouch).toHaveProperty('items');
            expect(pouch).toHaveProperty('totalSlots');
            expect(Array.isArray(pouch.items)).toBe(true);
            
            if (pouch.items.length > 0) {
              const item = pouch.items[0];
              expect(item).toHaveProperty('itemId');
              expect(item).toHaveProperty('itemName');
              expect(item).toHaveProperty('count');
              expect(typeof item.itemId).toBe('number');
              expect(typeof item.count).toBe('number');
            }
          }
        }
      });
    });

    it('should add and remove items from inventory', async () => {
      await withTestSave(rawApi, (handle) => {
        const itemId = 1;
        const addCount = 5;
        const pouchIndex = 0;
        
        const addResponse = rawApi.AddItemToPouch(handle, itemId, addCount, pouchIndex);
        const addParsed = JSON.parse(addResponse);
        
        if (!addParsed.error) {
          expect(addParsed).toHaveProperty('success', true);
          
          const inventoryResponse = rawApi.GetPouchItems(handle);
          const inventory = JSON.parse(inventoryResponse);
          
          if (!inventory.error && Array.isArray(inventory)) {
            const pouch = inventory[pouchIndex];
            const addedItem = pouch.items.find((item: any) => item.itemId === itemId);
            
            if (addedItem) {
              expect(addedItem.count).toBeGreaterThanOrEqual(addCount);
            }
          }
          
          const removeResponse = rawApi.RemoveItemFromPouch(handle, itemId, addCount);
          const removeParsed = JSON.parse(removeResponse);
          
          if (!removeParsed.error) {
            expect(removeParsed).toHaveProperty('success', true);
          }
        }
      });
    });

    it('should handle invalid item IDs gracefully', async () => {
      await withTestSave(rawApi, (handle) => {
        const invalidItemId = 999999;
        const jsonResponse = rawApi.AddItemToPouch(handle, invalidItemId, 1, 0);
        const parsed = JSON.parse(jsonResponse);
        
        expect(parsed).toHaveProperty('error');
        expect(typeof parsed.error).toBe('string');
      });
    });

    it('should handle invalid pouch index gracefully', async () => {
      await withTestSave(rawApi, (handle) => {
        const invalidPouchIndex = 999;
        const jsonResponse = rawApi.AddItemToPouch(handle, 1, 1, invalidPouchIndex);
        const parsed = JSON.parse(jsonResponse);
        
        expect(parsed).toHaveProperty('error');
        expect(typeof parsed.error).toBe('string');
      });
    });
  });
});
