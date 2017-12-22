echo "****************"
echo "BUILDING MOVES"
echo "****************"

ionic upload --note "MovesBuild" --deploy production
ionic cordova build android