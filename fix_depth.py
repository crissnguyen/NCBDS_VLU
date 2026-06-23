import os

folders = ['Web/src/pages/auth', 'Web/src/pages/property', 'Web/src/pages/user']

for folder in folders:
    for filename in os.listdir(folder):
        if not filename.endswith('.jsx'): continue
        filepath = os.path.join(folder, filename)
        with open(filepath, 'r') as f:
            code = f.read()
        
        # Replace ../components with ../../components
        code = code.replace('../components/', '../../components/')
        # Replace ../data with ../../data
        code = code.replace('../data/', '../../data/')
        # If there's any other ../ (like ../utils, ../assets)
        code = code.replace('../assets/', '../../assets/')
        
        with open(filepath, 'w') as f:
            f.write(code)

print("Imports fixed!")
