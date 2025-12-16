#!/bin/bash

# =============================================================================
# Module Management Script
# =============================================================================
# Save reusable modules from projects back to the template.
# Import modules from the template into new projects.
#
# Usage:
#   ./scripts/modules.sh list              - List available modules
#   ./scripts/modules.sh import <module>   - Import a module into current project
#   ./scripts/modules.sh save <name>       - Save current file(s) as a new module
#   ./scripts/modules.sh push              - Push module changes to template repo
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_step() { echo -e "${BLUE}▶${NC} $1"; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"
MODULES_DIR="$TEMPLATE_DIR/modules"
REGISTRY_FILE="$MODULES_DIR/registry.json"

# Check if jq is available (for JSON parsing)
HAS_JQ=$(command -v jq &> /dev/null && echo "yes" || echo "no")

# =============================================================================
# LIST MODULES
# =============================================================================

list_modules() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  Available Modules${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    if [ ! -f "$REGISTRY_FILE" ]; then
        print_error "Registry file not found: $REGISTRY_FILE"
        exit 1
    fi

    if [ "$HAS_JQ" = "yes" ]; then
        # Pretty print with jq
        jq -r '.modules[] | "  \(.id)\n    \(.name)\n    \(.description)\n    Category: \(.category)\n    Tags: \(.tags | join(", "))\n"' "$REGISTRY_FILE"
    else
        # Fallback: just cat the file
        echo "Modules registry:"
        cat "$REGISTRY_FILE"
        echo ""
        print_info "Install jq for better formatting: brew install jq"
    fi
}

# =============================================================================
# IMPORT MODULE
# =============================================================================

import_module() {
    local MODULE_ID="$1"

    if [ -z "$MODULE_ID" ]; then
        print_error "Please specify a module ID"
        echo "Usage: ./scripts/modules.sh import <module-id>"
        echo ""
        echo "Available modules:"
        if [ "$HAS_JQ" = "yes" ]; then
            jq -r '.modules[] | "  - \(.id): \(.name)"' "$REGISTRY_FILE"
        fi
        exit 1
    fi

    print_step "Importing module: $MODULE_ID"

    if [ "$HAS_JQ" != "yes" ]; then
        print_error "jq is required for import. Install with: brew install jq"
        exit 1
    fi

    # Get module info from registry
    local MODULE_INFO=$(jq -r ".modules[] | select(.id == \"$MODULE_ID\")" "$REGISTRY_FILE")

    if [ -z "$MODULE_INFO" ]; then
        print_error "Module not found: $MODULE_ID"
        exit 1
    fi

    local MODULE_NAME=$(echo "$MODULE_INFO" | jq -r '.name')
    local MODULE_CATEGORY=$(echo "$MODULE_INFO" | jq -r '.category')
    local MODULE_FILES=$(echo "$MODULE_INFO" | jq -r '.files[]')
    local MODULE_DEPS=$(echo "$MODULE_INFO" | jq -r '.dependencies[]' 2>/dev/null || echo "")

    echo "  Name: $MODULE_NAME"
    echo "  Category: $MODULE_CATEGORY"
    echo ""

    # Check for dependencies
    if [ -n "$MODULE_DEPS" ]; then
        print_info "This module has dependencies: $MODULE_DEPS"
        read -p "Import dependencies first? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for dep in $MODULE_DEPS; do
                import_module "$dep"
            done
        fi
    fi

    # Determine target directory
    local TARGET_DIR="."
    if [ -d "web/src" ]; then
        TARGET_DIR="web/src"
    elif [ -d "src" ]; then
        TARGET_DIR="src"
    fi

    # Create target directories
    mkdir -p "$TARGET_DIR/modules/$MODULE_CATEGORY"

    # Copy module files
    for file in $MODULE_FILES; do
        local SOURCE="$MODULES_DIR/$file"
        local DEST="$TARGET_DIR/modules/$file"

        if [ -f "$SOURCE" ]; then
            mkdir -p "$(dirname "$DEST")"
            cp "$SOURCE" "$DEST"
            print_success "Copied: $file"
        else
            print_error "Source file not found: $SOURCE"
        fi
    done

    echo ""
    print_success "Module imported: $MODULE_NAME"
    print_info "Files are in: $TARGET_DIR/modules/$MODULE_CATEGORY/"
    print_info "Update imports in your code to use the new location"
}

# =============================================================================
# SAVE MODULE
# =============================================================================

save_module() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  Save New Module${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Get module details
    read -p "Module ID (lowercase, hyphens): " MODULE_ID
    read -p "Module Name: " MODULE_NAME
    read -p "Description: " MODULE_DESC

    echo ""
    echo "Categories:"
    echo "  1) components"
    echo "  2) patterns"
    echo "  3) hooks"
    echo "  4) utils"
    echo "  5) styles"
    read -p "Select category [1-5]: " CAT_CHOICE

    case $CAT_CHOICE in
        1) CATEGORY="components";;
        2) CATEGORY="patterns";;
        3) CATEGORY="hooks";;
        4) CATEGORY="utils";;
        5) CATEGORY="styles";;
        *) CATEGORY="patterns";;
    esac

    read -p "Tags (comma-separated): " TAGS
    read -p "Source project/iteration: " SOURCE

    echo ""
    echo "Enter file paths to include (relative to current dir)."
    echo "Enter empty line when done."

    FILES=()
    while true; do
        read -p "File path: " FILE_PATH
        if [ -z "$FILE_PATH" ]; then
            break
        fi
        if [ -f "$FILE_PATH" ]; then
            FILES+=("$FILE_PATH")
            print_success "Added: $FILE_PATH"
        else
            print_error "File not found: $FILE_PATH"
        fi
    done

    if [ ${#FILES[@]} -eq 0 ]; then
        print_error "No files specified"
        exit 1
    fi

    # Create module directory
    mkdir -p "$MODULES_DIR/$CATEGORY"

    # Copy files
    REGISTRY_FILES=()
    for file in "${FILES[@]}"; do
        FILENAME=$(basename "$file")
        DEST="$MODULES_DIR/$CATEGORY/$FILENAME"
        cp "$file" "$DEST"
        REGISTRY_FILES+=("$CATEGORY/$FILENAME")
        print_success "Copied: $file -> $DEST"
    done

    # Update registry (manual for now - requires jq for proper JSON manipulation)
    echo ""
    print_info "Add this entry to $REGISTRY_FILE:"
    echo ""
    echo "{"
    echo "  \"id\": \"$MODULE_ID\","
    echo "  \"name\": \"$MODULE_NAME\","
    echo "  \"description\": \"$MODULE_DESC\","
    echo "  \"category\": \"$CATEGORY\","
    echo "  \"files\": [$(printf '\"%s\",' "${REGISTRY_FILES[@]}" | sed 's/,$//')],"
    echo "  \"dependencies\": [],"
    echo "  \"tags\": [$(echo "$TAGS" | sed 's/,/\",\"/g' | sed 's/^/\"/' | sed 's/$/\"/')],"
    echo "  \"addedFrom\": \"$SOURCE\","
    echo "  \"addedAt\": \"$(date +%Y-%m-%d)\""
    echo "}"
    echo ""

    print_success "Module files saved to: $MODULES_DIR/$CATEGORY/"
    print_info "Remember to update registry.json and commit changes"
}

# =============================================================================
# PUSH TO TEMPLATE
# =============================================================================

push_modules() {
    print_step "Pushing module changes to template repository..."

    cd "$TEMPLATE_DIR"

    # Check for changes
    if [ -z "$(git status --porcelain modules/)" ]; then
        print_info "No module changes to push"
        exit 0
    fi

    # Show changes
    git status modules/

    echo ""
    read -p "Commit and push these changes? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Commit message: " COMMIT_MSG
        git add modules/
        git commit -m "feat(modules): $COMMIT_MSG"
        git push origin main
        print_success "Modules pushed to template repository"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

case "${1:-}" in
    list|ls)
        list_modules
        ;;
    import|add)
        import_module "$2"
        ;;
    save|create)
        save_module
        ;;
    push|sync)
        push_modules
        ;;
    *)
        echo "Module Management"
        echo ""
        echo "Usage:"
        echo "  ./scripts/modules.sh list              - List available modules"
        echo "  ./scripts/modules.sh import <module>   - Import a module"
        echo "  ./scripts/modules.sh save              - Save a new module"
        echo "  ./scripts/modules.sh push              - Push changes to template"
        echo ""
        echo "Examples:"
        echo "  ./scripts/modules.sh list"
        echo "  ./scripts/modules.sh import toast-system"
        echo "  ./scripts/modules.sh import color-palette"
        ;;
esac
