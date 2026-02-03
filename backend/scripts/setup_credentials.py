"""
AerisQ - Easy Credentials Setup
Helper script to save CDSE credentials to .env file
"""
import os
from pathlib import Path

def setup_credentials():
    """Interactive credential setup"""
    
    print("=" * 60)
    print("   AerisQ - CDSE Credentials Setup")
    print("=" * 60)
    print()
    print("This will save your CDSE credentials to .env file")
    print()
    
    # Get credentials
    print("Enter your CDSE credentials:")
    print("(These will be saved to backend/.env)")
    print()
    
    username = input("CDSE Username (or email): ").strip()
    password = input("CDSE Password: ").strip()
    
    if not username or not password:
        print("\n❌ Error: Username and password cannot be empty")
        return False
    
    # Find .env file
    env_path = Path(__file__).parent.parent / ".env"
    
    if not env_path.exists():
        print(f"\n❌ Error: .env file not found at {env_path}")
        print("   Create it by copying .env.example")
        return False
    
    # Read current .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update credentials
    updated_lines = []
    username_set = False
    password_set = False
    
    for line in lines:
        if line.startswith('CDSE_USERNAME='):
            updated_lines.append(f'CDSE_USERNAME={username}\n')
            username_set = True
        elif line.startswith('CDSE_PASSWORD='):
            updated_lines.append(f'CDSE_PASSWORD={password}\n')
            password_set = True
        else:
            updated_lines.append(line)
    
    # Add if not found
    if not username_set:
        updated_lines.append(f'\nCDSE_USERNAME={username}\n')
    if not password_set:
        updated_lines.append(f'CDSE_PASSWORD={password}\n')
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print(f"\n✅ Credentials saved to: {env_path}")
    print()
    
    # Test connection
    print("Testing connection...")
    print()
    
    try:
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent))
        
        from app.agents.scout import ScoutAgent
        import asyncio
        
        scout = ScoutAgent()
        
        if not scout.auth:
            print("⚠️  Warning: Scout auth not initialized")
            print("   But credentials are saved. Try running:")
            print("   python scripts/test_setup.py")
            return True
        
        # Try auth
        async def test():
            try:
                token = await scout.auth.get_token()
                return bool(token)
            except Exception as e:
                print(f"❌ Authentication failed: {e}")
                print()
                print("Possible issues:")
                print("- Wrong username/password")
                print("- Email not verified yet")
                print("- CDSE service temporarily down")
                print()
                print("Try:")
                print("1. Login to https://dataspace.copernicus.eu/ manually")
                print("2. Verify email if you haven't")
                print("3. Check username/password")
                return False
        
        success = asyncio.run(test())
        
        if success:
            print("✅ CDSE Authentication successful!")
            print()
            print("🎉 You're ready to download satellite data!")
            print()
            print("Next step:")
            print("  python scripts/download_real_sar.py \\")
            print("    --area '37.5,-6.0,38.5,-5.0' \\")
            print("    --date '2023-07-15'")
            print()
        
        return success
        
    except Exception as e:
        print(f"⚠️  Could not test connection: {e}")
        print("   But credentials are saved.")
        print()
        print("Run this to test:")
        print("  python scripts/test_setup.py")
        print()
        return True


if __name__ == "__main__":
    print()
    print("Make sure you completed CDSE registration first!")
    print("Register at: https://dataspace.copernicus.eu/")
    print()
    input("Press Enter when ready to add credentials...")
    print()
    
    setup_credentials()
