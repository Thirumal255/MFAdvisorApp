import chromadb
print(f"Version: {chromadb.__version__}")

# Test 1: PersistentClient
try:
    client = chromadb.PersistentClient(path="./test_chroma")
    print("✅ PersistentClient works!")
except Exception as e:
    print(f"❌ PersistentClient failed: {e}")

# Test 2: Basic Client
try:
    client = chromadb.Client()
    print("✅ Basic Client works!")
except Exception as e:
    print(f"❌ Basic Client failed: {e}")