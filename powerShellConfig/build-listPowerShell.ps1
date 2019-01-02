param (   
    [string]$username = $(throw "-username is required."),
    [string]$siteUrl = $(throw "-siteUrl is required.")
)

$cred = Get-Credential -UserName $username -Message "Enter SPO credentials for $userName : "

Connect-PnPOnline -Url $siteUrl -Credentials $cred

$pages = Get-PnPList -Identity Pages

$pagesId = $pages.Id

Write-Host "Page Id is {$pagesId}"

$xml = "<Field Type='Lookup' 
    DisplayName='Related Page' 
    Required='TRUE' 
    EnforceUniqueValues='FALSE' 
    ShowField='Title' 
    RelationshipDeleteBehavior='None' 
    ID='{006aa15d-e500-499b-b5a2-2cab6bc314a5}' 
    List='{$pagesId}' 
    StaticName='Page' 
    Name='Page' />"

New-PnPList -Title News -Template GenericList

Add-PnPField -DisplayName 'News Date' -InternalName NewsDate -Type DateTime -List "News"
Add-PnPFieldFromXml -FieldXml $xml -List "News"
Add-PnPField -DisplayName 'News Teaser' -InternalName NewsTeaser -Type Text -List "News"
Add-PnPField -DisplayName 'News Content' -InternalName NewsContent -Type Note -List "News"
Add-PnPField -DisplayName 'News Image URL' -InternalName NewsImage -Type Text -List "News" 
Add-PnPField -DisplayName 'Top News' -InternalName TopNews -Type Boolean -List "News"
Add-PnPField -DisplayName 'Highlight News' -InternalName HighlightNews -Type Boolean -List "News"
Add-PnPField -DisplayName 'Show Image' -InternalName ShowImage -Type Boolean -List "News"

Disconnect-PnPOnline 

Write-Host "Complete" -ForegroundColor Green

