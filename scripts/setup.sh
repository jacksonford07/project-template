#!/bin/bash

# =============================================================================
# Project Template Setup Script
# =============================================================================
# This script helps new users set up their development environment and
# create a new project from this template.
#
# Usage: ./scripts/setup.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)    echo "macos";;
        Linux*)     echo "linux";;
        MINGW*|MSYS*|CYGWIN*) echo "windows";;
        *)          echo "unknown";;
    esac
}

OS=$(detect_os)

# =============================================================================
# PACKAGE MANAGER DETECTION
# =============================================================================

detect_package_manager() {
    if command_exists brew; then
        echo "brew"
    elif command_exists apt-get; then
        echo "apt"
    elif command_exists yum; then
        echo "yum"
    elif command_exists choco; then
        echo "choco"
    elif command_exists winget; then
        echo "winget"
    else
        echo "none"
    fi
}

PKG_MANAGER=$(detect_package_manager)

# =============================================================================
# NODE.JS CHECK
# =============================================================================

check_node() {
    print_header "Checking Node.js"

    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_success "Node.js found: $NODE_VERSION"

        # Check if version is >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_warning "Node.js 18+ recommended. Current: $NODE_VERSION"
            print_info "Visit https://nodejs.org to upgrade"
        fi
    else
        print_error "Node.js not found"
        print_info "Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
}

# =============================================================================
# PNPM CHECK & INSTALL
# =============================================================================

check_pnpm() {
    print_header "Checking pnpm"

    if command_exists pnpm; then
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm found: $PNPM_VERSION"
    else
        print_warning "pnpm not found"
        echo ""
        read -p "Would you like to install pnpm? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Installing pnpm..."
            npm install -g pnpm
            print_success "pnpm installed"
        else
            print_info "You can install pnpm later with: npm install -g pnpm"
            print_info "Or use npm instead of pnpm for this project"
        fi
    fi
}

# =============================================================================
# GIT CHECK
# =============================================================================

check_git() {
    print_header "Checking Git"

    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "$GIT_VERSION"

        # Check if git is configured
        GIT_USER=$(git config --global user.name 2>/dev/null || echo "")
        GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")

        if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
            print_warning "Git user not configured"
            echo ""
            read -p "Enter your name for Git commits: " GIT_NAME
            read -p "Enter your email for Git commits: " GIT_EMAIL_INPUT
            git config --global user.name "$GIT_NAME"
            git config --global user.email "$GIT_EMAIL_INPUT"
            print_success "Git configured"
        else
            print_success "Git user: $GIT_USER <$GIT_EMAIL>"
        fi
    else
        print_error "Git not found"
        print_info "Please install Git from https://git-scm.com"
        exit 1
    fi
}

# =============================================================================
# GITHUB CLI CHECK & INSTALL
# =============================================================================

check_github_cli() {
    print_header "Checking GitHub CLI"

    if command_exists gh; then
        GH_VERSION=$(gh --version | head -n 1)
        print_success "$GH_VERSION"

        # Check if logged in
        if gh auth status >/dev/null 2>&1; then
            GH_USER=$(gh api user -q .login 2>/dev/null || echo "authenticated")
            print_success "Logged in as: $GH_USER"
        else
            print_warning "Not logged in to GitHub"
            echo ""
            read -p "Would you like to log in to GitHub now? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_step "Starting GitHub login..."
                gh auth login
                print_success "GitHub login complete"
            else
                print_info "You can log in later with: gh auth login"
            fi
        fi
    else
        print_warning "GitHub CLI not found"
        echo ""
        echo "GitHub CLI is required to create new repositories."
        read -p "Would you like to install GitHub CLI? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_github_cli
        else
            print_info "You can install it later:"
            print_info "  macOS: brew install gh"
            print_info "  Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
            print_info "  Windows: winget install GitHub.cli"
        fi
    fi
}

install_github_cli() {
    print_step "Installing GitHub CLI..."

    case $PKG_MANAGER in
        brew)
            brew install gh
            ;;
        apt)
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh
            ;;
        choco)
            choco install gh
            ;;
        winget)
            winget install GitHub.cli
            ;;
        *)
            print_error "Could not auto-install. Please install manually:"
            print_info "https://github.com/cli/cli#installation"
            return 1
            ;;
    esac

    print_success "GitHub CLI installed"

    # Prompt for login
    echo ""
    read -p "Would you like to log in to GitHub now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh auth login
        print_success "GitHub login complete"
    fi
}

# =============================================================================
# VERCEL CLI CHECK & INSTALL
# =============================================================================

check_vercel_cli() {
    print_header "Checking Vercel CLI"

    if command_exists vercel; then
        VERCEL_VERSION=$(vercel --version 2>/dev/null | head -n 1)
        print_success "Vercel CLI: $VERCEL_VERSION"

        # Check if logged in
        if vercel whoami >/dev/null 2>&1; then
            VERCEL_USER=$(vercel whoami 2>/dev/null)
            print_success "Logged in as: $VERCEL_USER"
        else
            print_warning "Not logged in to Vercel"
            echo ""
            read -p "Would you like to log in to Vercel now? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_step "Starting Vercel login..."
                vercel login
                print_success "Vercel login complete"
            else
                print_info "You can log in later with: vercel login"
            fi
        fi
    else
        print_warning "Vercel CLI not found"
        echo ""
        echo "Vercel CLI is required for deployment."
        read -p "Would you like to install Vercel CLI? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_vercel_cli
        else
            print_info "You can install it later with: npm install -g vercel"
        fi
    fi
}

install_vercel_cli() {
    print_step "Installing Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installed"

    # Prompt for login
    echo ""
    read -p "Would you like to log in to Vercel now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel login
        print_success "Vercel login complete"
    fi
}

# =============================================================================
# CREATE NEW PROJECT
# =============================================================================

create_new_project() {
    print_header "Create New Project"

    echo "This will create a new Git repository from this template."
    echo ""

    # Get project name
    read -p "Enter your project name (lowercase, no spaces): " PROJECT_NAME

    # Validate project name
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Invalid project name. Use only lowercase letters, numbers, and hyphens."
        return 1
    fi

    # Get parent directory
    read -p "Enter the parent directory for your project [~/projects]: " PARENT_DIR
    PARENT_DIR=${PARENT_DIR:-~/projects}
    PARENT_DIR="${PARENT_DIR/#\~/$HOME}"

    # Create directory if it doesn't exist
    mkdir -p "$PARENT_DIR"

    PROJECT_PATH="$PARENT_DIR/$PROJECT_NAME"

    if [ -d "$PROJECT_PATH" ]; then
        print_error "Directory already exists: $PROJECT_PATH"
        return 1
    fi

    print_step "Creating project at: $PROJECT_PATH"

    # Copy template (excluding .git)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"

    mkdir -p "$PROJECT_PATH"
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' "$TEMPLATE_DIR/" "$PROJECT_PATH/"

    print_success "Template copied"

    # Initialize new git repo
    cd "$PROJECT_PATH"
    git init
    print_success "Git repository initialized"

    # Update package.json name
    if [ -f "web/package.json" ]; then
        if command_exists jq; then
            jq ".name = \"$PROJECT_NAME\"" web/package.json > web/package.json.tmp && mv web/package.json.tmp web/package.json
        else
            sed -i.bak "s/\"name\": \".*\"/\"name\": \"$PROJECT_NAME\"/" web/package.json && rm -f web/package.json.bak
        fi
        print_success "Updated package.json name"
    fi

    # Create GitHub repository
    echo ""
    read -p "Would you like to create a GitHub repository? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists gh && gh auth status >/dev/null 2>&1; then
            read -p "Make repository private? (y/n) " -n 1 -r
            echo ""

            VISIBILITY="--public"
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                VISIBILITY="--private"
            fi

            print_step "Creating GitHub repository..."
            gh repo create "$PROJECT_NAME" $VISIBILITY --source=. --push
            print_success "GitHub repository created and pushed"
        else
            print_warning "GitHub CLI not configured. Create repo manually or run: gh auth login"
        fi
    fi

    # Install dependencies
    echo ""
    read -p "Would you like to install dependencies now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd web
        if command_exists pnpm; then
            print_step "Installing dependencies with pnpm..."
            pnpm install
        else
            print_step "Installing dependencies with npm..."
            npm install
        fi
        print_success "Dependencies installed"
        cd ..
    fi

    # Link to Vercel
    echo ""
    read -p "Would you like to link this project to Vercel? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists vercel && vercel whoami >/dev/null 2>&1; then
            cd web
            print_step "Linking to Vercel..."
            vercel link
            print_success "Linked to Vercel"
            cd ..
        else
            print_warning "Vercel CLI not configured. Link later with: cd web && vercel link"
        fi
    fi

    print_header "Project Created Successfully!"

    echo "Your new project is ready at: $PROJECT_PATH"
    echo ""
    echo "Next steps:"
    echo "  1. cd $PROJECT_PATH/web"
    echo "  2. cp .env.example .env"
    echo "  3. Edit .env with your configuration"
    echo "  4. pnpm dev  (or npm run dev)"
    echo ""
    echo "To deploy:"
    echo "  vercel --prod"
    echo ""
    echo "Happy coding!"
}

# =============================================================================
# DEPLOY PROJECT
# =============================================================================

deploy_project() {
    print_header "Deploy to Vercel"

    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ -f "web/package.json" ]; then
        cd web
    fi

    if [ ! -f "package.json" ]; then
        print_error "No package.json found. Are you in the project directory?"
        return 1
    fi

    # Check Vercel CLI
    if ! command_exists vercel; then
        print_error "Vercel CLI not installed"
        read -p "Would you like to install it now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_vercel_cli
        else
            return 1
        fi
    fi

    # Check if logged in
    if ! vercel whoami >/dev/null 2>&1; then
        print_warning "Not logged in to Vercel"
        print_step "Starting Vercel login..."
        vercel login
    fi

    # Build and deploy
    echo ""
    read -p "Deploy to production? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Deploying to production..."
        vercel --prod
    else
        print_step "Deploying preview..."
        vercel
    fi

    print_success "Deployment complete!"
}

# =============================================================================
# MAIN MENU
# =============================================================================

show_menu() {
    print_header "Project Template Setup"

    echo "What would you like to do?"
    echo ""
    echo "  1) Check development environment"
    echo "  2) Create a new project from this template"
    echo "  3) Deploy current project to Vercel"
    echo "  4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice

    case $choice in
        1)
            check_node
            check_pnpm
            check_git
            check_github_cli
            check_vercel_cli
            print_header "Environment Check Complete"
            ;;
        2)
            check_git
            check_github_cli
            create_new_project
            ;;
        3)
            deploy_project
            ;;
        4)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            show_menu
            ;;
    esac
}

# =============================================================================
# RUN
# =============================================================================

# If script is run with arguments, handle them
case "${1:-}" in
    check|env)
        check_node
        check_pnpm
        check_git
        check_github_cli
        check_vercel_cli
        ;;
    new|create)
        check_git
        check_github_cli
        create_new_project
        ;;
    deploy)
        deploy_project
        ;;
    *)
        show_menu
        ;;
esac
