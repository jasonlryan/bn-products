# Technical Backlog - BN Products System

**Created:** 2025-08-15  
**Status:** Active Development Backlog  
**Priority:** Low - Technical Debt & Enhancements

## Overview

This backlog contains technical improvements and cleanup tasks identified during QA review. All items are **non-blocking** and can be addressed when development capacity allows. The system is currently stable and production-ready.

---

## 🔧 **Technical Debt**

### **TD-001: Schema Validation Not Implemented**
- **Type:** Technical Debt
- **Priority:** Medium
- **Effort:** 1-2 days
- **Description:** Runtime schema validation missing for product configuration
- **Files:** `config/product-config.schema.json` exists but not used
- **Impact:** Invalid data could corrupt system state (theoretical risk)
- **Implementation:**
  ```bash
  npm install ajv
  ```
  ```typescript
  import Ajv from 'ajv';
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  ```

### **TD-002: Model Reference Inconsistencies**
- **Type:** Configuration Cleanup
- **Priority:** Low
- **Effort:** 1 day
- **Description:** Config files reference non-existent "GPT-o3" models
- **Files:** `config/product-config-master.json`, various archived configs
- **Impact:** Confusion about actual models being used
- **Fix:** Replace "GPT-o3" references with environment-based model configuration

### **TD-003: Naming Convention Inconsistencies**
- **Type:** Code Quality
- **Priority:** Low  
- **Effort:** 2-3 days
- **Description:** Mixed naming patterns across codebase
- **Examples:** 
  - `marketIntelligencePrompt` vs `MARKET_INTELLIGENCE_COMPILATION_PROMPT`
  - Various TypeScript export naming conflicts
- **Impact:** Developer confusion, maintenance overhead
- **Solution:** Standardize naming conventions and create style guide

---

## 🗂️ **Organization & Cleanup**

### **ORG-001: Backup File Management**
- **Type:** Organization
- **Priority:** Low
- **Effort:** 0.5 days
- **Description:** Archive directory needs better organization
- **Current State:** `archive/products_backup_20250814_114732/` contains old 15-stage structure
- **Action:** 
  - Document difference between current (14-stage) vs archived (15-stage) structure
  - Improve archive organization with README files
  - Consider removing if not needed

### **ORG-002: Configuration File Sprawl** 
- **Type:** Organization
- **Priority:** Low
- **Effort:** 0.5 days
- **Description:** Multiple config variants in archive directories
- **Files:** Various `product-config*.json` files in `/archive/old-configs/`
- **Impact:** Unclear which configuration is authoritative
- **Action:** Document config evolution and consolidate/remove obsolete versions

---

## 📚 **Documentation**

### **DOC-001: Developer Setup Guide**
- **Type:** Documentation
- **Priority:** Medium (when new developers join)
- **Effort:** 1 day
- **Description:** Create comprehensive setup documentation
- **Includes:**
  - Environment variable template (`.env.example`)
  - Local development setup steps
  - Common troubleshooting guide
  - Architecture overview for new developers

### **DOC-002: Migration Documentation**
- **Type:** Documentation  
- **Priority:** Low
- **Effort:** 1 day
- **Description:** Document version control and migration procedures
- **Current:** Config shows "version": "3.0" but no migration docs
- **Need:** Rollback procedures, version upgrade paths, breaking change documentation

---

## 🚀 **Enhancement Opportunities**

### **ENH-001: JSON Output Validation**
- **Type:** Enhancement
- **Priority:** Low
- **Effort:** 1 day
- **Description:** Add validation for compilation JSON outputs
- **Current:** Compilation prompts require JSON but no validation
- **Benefit:** Prevent malformed outputs from crashing dashboard
- **Implementation:** Try/catch blocks with schema validation

### **ENH-002: Automated Archive Management**
- **Type:** Process Improvement
- **Priority:** Low
- **Effort:** 1 day
- **Description:** Automate backup and archive workflows
- **Features:**
  - Automated timestamped backups
  - Archive cleanup policies
  - Documentation generation for archived content

---

## 📋 **Implementation Guidelines**

### **When to Work on Backlog Items:**
1. ✅ **Core product suite is complete** (all 8 products generated)
2. ✅ **System is fully operational** (compilation pipeline working end-to-end)  
3. ✅ **Have spare development capacity** (no urgent business features needed)
4. 🔄 **New developers joining** (setup/documentation becomes more important)

### **Priority Order:**
1. **Medium Priority:** Schema validation, developer setup guide
2. **Low Priority:** Everything else (technical debt, cleanup, enhancements)

### **Success Metrics:**
- [ ] No runtime schema validation errors
- [ ] Clean, consistent naming across codebase  
- [ ] New developer can set up system in <30 minutes
- [ ] Archive structure is self-documenting
- [ ] Zero configuration confusion

---

## 📝 **Notes**

- **System Stability:** HIGH - All backlog items are enhancements, not fixes
- **Business Impact:** LOW - Core functionality unaffected by these items
- **Technical Risk:** LOW - Existing system has proper fallbacks and error handling
- **Maintenance Overhead:** MEDIUM - Technical debt will slow future development if not addressed

*This backlog represents technical polish rather than critical fixes. The system is production-ready without these improvements.*